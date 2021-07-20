import random
from django.conf import settings
from django.db.models import Q
from django.db.models.query import QuerySet
from rest_framework.request import Request
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from chess.models import Party as ChessParty
from gomoku.models import Party as GomokuParty
from .models import User, FriendRequest, Message, Queue, Game


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
        active_users=User.objects.filter(is_active=True)
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


def update_queue(game: Game, token: str) -> (ChessParty, GomokuParty):
    """Обновить очередь определенной игры"""

    queue = Queue.objects.get(game=game)

    if token is None:
        queue.player1 = None
        queue.save()
        return

    player = get_user_by_token(token)

    if queue.player1 is None:
        queue.player1 = player
        queue.save()
    elif queue.player1 == player:
        queue.player1 = None
        queue.save()
    else:
        # если очередь заполнена, создается игра и очищается очередь
        party = None

        if game.name == 'Шахматы':
            random_int = random.randint(0, 1)

            if random_int == 0:
                party = ChessParty.objects.create(white=queue.player1, black=player)
            else:
                party = ChessParty.objects.create(white=player, black=queue.player1)
        elif game.name == 'Гомоку':
            party = GomokuParty.objects.create(player1=queue.player1, player2=player)

        queue.player1 = None
        queue.save()
        return party


def get_domain():
    """Получить домен"""

    return settings.ALLOWED_HOSTS[0] + ':8000' if settings.ALLOWED_HOSTS[0] == '127.0.0.1' \
        else settings.ALLOWED_HOSTS[0]


def get_user_profile_info(user: User, request: Request, serializer) -> dict:
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
