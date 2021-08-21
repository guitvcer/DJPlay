from django.db.models import Q
from django.db.models.query import QuerySet
from django.urls import resolve
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.serializers import SerializerMetaclass
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from .models import User, FriendRequest, Message, Game, UserView


def get_user_by_token(access_token: str) -> User:
    """Получить пользователя по токену"""

    access = AccessToken(access_token)
    user = User.objects.get(id=access['user_id'])

    return user


def generate_tokens(user: User) -> dict:
    refresh = RefreshToken.for_user(user)

    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


def get_active_users_by_filter(
        request: Request,
        active_users=User.active.all()
) -> QuerySet:
    """Получить всех активных пользователей по фильтру"""

    query = request.data.get('query')

    if query is not None:
        r = Q(username__icontains=query) | Q(first_name__icontains=query) | \
            Q(last_name__icontains=query) | Q(email__icontains=query)
        active_users = active_users.filter(r)

    if request.data.get('is_online'):
        active_users = active_users.filter(is_online=True)

    if request.user.is_authenticated:
        active_users = active_users.exclude(id=request.user.id)

        if request.data.get('is_friend'):
            friends = request.user.get_friends()
            ids_filtered_users = []

            for friend in friends:
                for active_user in active_users:
                    if friend == active_user:
                        ids_filtered_users.append(friend.id)

            return User.objects.filter(id__in=ids_filtered_users)

    return active_users


def create_or_delete_or_accept_friend_request(request_from: User, username_of_request_to: str) -> str:
    """Создать|удалить|принять запрос на дружбу"""

    request_to = User.objects.get(username=username_of_request_to)

    try:
        try:
            # Отменить запрос на дружбу

            message = "Вы отменили запрос на дружбу."
            request = FriendRequest.objects.get(request_from=request_from, request_to=request_to)

            if request.is_active:
                message = "Вы удалили пользователя из друзей."

            request.delete()
            return message

        except FriendRequest.DoesNotExist:
            # Принять запрос на дружбу

            request = FriendRequest.objects.get(
                request_from=request_to,
                request_to=request_from)

            if request.is_active:
                message = "Вы удалили пользователя из друзей."
            else:
                message = "Вы приняли запрос на дружбу."

            request.is_active = not request.is_active
            request.save()

            return message
    except FriendRequest.DoesNotExist:
        # Отправить запрос на дружбу

        FriendRequest.objects.create(request_from=request_from, request_to=request_to)

        return "Вы отправили запрос на дружбу."


def get_last_messages_with_every_user(current_user: User) -> QuerySet:
    """Получить последние сообщения с каждым пользователем"""

    all_users = User.objects.all()
    list_of_ids = []

    for user in all_users:
        messages = current_user.get_messages(user)

        if messages.count() > 0:
            list_of_ids.append(messages.last().id)

    messages = Message.objects.filter(id__in=list_of_ids)

    return messages


def search_messages(keyword: str, messages=Message.objects.all()) -> QuerySet:
    """Искать сообщение"""

    return messages.filter(Q(text__icontains=keyword))


def get_user_profile_info(user: User, request: Request, serializer: SerializerMetaclass) -> dict:
    """Получить информацию о пользователе"""

    if user.has_access_to_view_data_of_another_user(request):
        data = {
            'views': user.get_views().count()
        }
        data.update(serializer(user).data)

        if request.user == user:
            data['is_me'] = True
    else:
        data = {
            'username': user.username,
            'is_private': user.is_private,
            'avatar': user.avatar.url
        }

    if data.get('is_me') is None:
        if request.user.is_authenticated:
            try:
                friend_request = FriendRequest.objects.get(request_from=user, request_to=request.user)

                if friend_request.is_active:
                    data['friend_request'] = 'accepted'
                else:
                    data['friend_request'] = 'got'
            except FriendRequest.DoesNotExist:
                try:
                    friend_request = FriendRequest.objects.get(request_from=request.user, request_to=user)

                    if friend_request.is_active:
                        data['friend_request'] = 'accepted'
                    else:
                        data['friend_request'] = 'sent'
                except FriendRequest.DoesNotExist:
                    data['friend_request'] = False

    data['friends'] = user.get_friends().count()

    return data


def get_users_friends_or_views(url_name: str, user: User) -> (QuerySet, None):
    """Получить друзей/просмотры пользователя по адресу"""

    if url_name in ('users_friends', 'friends'):
        return user.get_friends()
    elif url_name in ('users_views', 'views'):
        return user.get_views()


def get_users_list_or_403(request: Request, username: str) -> QuerySet:
    """Получить список пользователей"""

    url_name = resolve(request.path_info).url_name

    if url_name in ('users_friends', 'users_views', 'friends', 'views'):
        if username is None:
            user = request.user
        else:
            user = get_object_or_404(User.objects.all(), username=username)

        if user.has_access_to_view_data_of_another_user(request):
            return get_users_friends_or_views(url_name, user)
        else:
            raise PermissionDenied
    else:
        return get_active_users_by_filter(request)


def get_specific_or_current_user_info(request: Request, username: str, serializer: SerializerMetaclass) -> (dict, User):
    """Получить информацию об определенного или текущего пользователя"""

    # получить информацию определенного пользователя
    if username:
        user = get_object_or_404(User.active.all(), username=username)
        return get_user_profile_info(user, request, serializer), user

    # получить информацию о текущем пользователе
    if request.user.is_authenticated:
        return get_user_profile_info(request.user, request, serializer), request.user

    raise NotAuthenticated


def get_specific_or_current_users_party_list(request: Request, username: str, game: Game) -> QuerySet:
    """Получить список сыгранных партии текущего или определенного пользователя"""

    # получить QuerySet из партии определенного пользователя
    if username:
        user = get_object_or_404(User.active.all(), username=username)
        return user.get_party_list(game)

    # получить QuerySet из партии текущего пользователя
    if request.user.is_authenticated:
        return request.user.get_party_list(game)

    raise NotAuthenticated


def add_user_view(request: Request, user: User) -> None:
    """Добавить авторизованного пользователя в список просмотров профиля определенного пользователя"""

    if request.user.is_authenticated and request.user not in user.get_views():
        UserView.objects.create(view_from=request.user, view_to=user)
