import os
import requests
from django.conf import settings
from django.db.models import Q
from django.db.models.query import QuerySet
from django.urls import resolve
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, ParseError, NotFound
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.serializers import SerializerMetaclass
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from social_core.backends.vk import VKOAuth2

from chat.services import get_or_create_chat
from .models import User, FriendRequest, Game, UserView


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

    if request.user.is_authenticated and request.user != user and request.user not in user.get_views():
        UserView.objects.create(view_from=request.user, view_to=user)


def download_file_by_url(url: str, file_name: str) -> None:
    """Скачать файл по url"""

    file = requests.get(url)
    downloaded_file_absolute_url = f'{settings.BASE_DIR}/media/{file_name}'

    if not os.path.exists(downloaded_file_absolute_url):
        downloaded_file = open(downloaded_file_absolute_url, 'wb')
        downloaded_file.write(file.content)
        downloaded_file.close()


def google_authorization(code: str) -> dict:
    """Получить JWT токены авторизации и создать пользователя (если нету) по токену Google"""

    if code is None:
        raise ParseError

    google_tokens = requests.post('https://www.googleapis.com/oauth2/v4/token', headers={
        'Content-Type': 'application/x-www-form-urlencoded',
    }, data={
        'code': code,
        'redirect_uri': f'{settings.CORS_ALLOWED_ORIGINS[0]}/account/google-oauth2/',
        'client_id': settings.SOCIAL_AUTH_GOOGLE_OAUTH_KEY,
        'client_secret': settings.SOCIAL_AUTH_GOOGLE_OAUTH_SECRET,
        'scope': '',
        'grant_type': 'authorization_code',
    })

    if google_tokens.status_code == 400:
        raise ParseError

    google_user_data = requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + google_tokens.json()['access_token']
    ).json()

    try:
        user = User.objects.get(username=google_user_data['name'])

        if not user.is_active:
            raise NotFound
    except User.DoesNotExist:
        avatar_url = f"{google_user_data['name']}.png"
        download_file_by_url(google_user_data['picture'], avatar_url)

        user = User.objects.create(
            username=google_user_data['name'],
            first_name=google_user_data['given_name'],
            last_name=google_user_data['family_name'],
            email=google_user_data['email'],
            avatar=avatar_url
        )
        get_or_create_chat(user, user)

    return generate_tokens(user)


def vk_authorization(access_token: str) -> dict:
    """Получить JWT токены авторизации и создать пользователя (если нету) по токену VK"""

    if access_token is None:
        raise NotFound

    vk_user_data = VKOAuth2().user_data(access_token=access_token)

    try:
        user = User.objects.get(username=vk_user_data['screen_name'])

        if not user.is_active:
            raise NotFound
    except User.DoesNotExist:
        avatar_url = f"{vk_user_data['screen_name']}.png"
        download_file_by_url(vk_user_data['photo'], avatar_url)

        user = User.objects.create(
            username=vk_user_data['screen_name'],
            first_name=vk_user_data['first_name'],
            last_name=vk_user_data['last_name'],
            email=vk_user_data.get('email'),
            avatar=avatar_url,
            provider='VK'
        )
        get_or_create_chat(user, user)

    return generate_tokens(user)
