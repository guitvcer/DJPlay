import random
from django.conf import settings
from django.core.handlers.asgi import ASGIRequest
from django.db.models import Q
from django.db.models.query import QuerySet
from django.utils.datastructures import MultiValueDictKeyError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from chess.models import Party as ChessParty
from gomoku.models import Party as GomokuParty
from .models import MainUser, FriendRequest, Message, Queue, Game


def get_access_token(request: ASGIRequest) -> (str, bool):
    """Получить access токен или False"""

    authorization = request.headers.get('Authorization')

    if authorization:
        return authorization.split(' ')[1]

    return False


def is_authenticated(request: ASGIRequest) -> bool:
    """Авторизован ли пользователь"""

    print(request.headers)

    try:
        request.headers['Authorization'].split(' ')[1]
    except KeyError:
        return False
    else:
        return True


def get_user_by_token(access_token: str) -> MainUser:
    """Получить пользователя по токену"""

    access = AccessToken(access_token)
    user = MainUser.objects.get(id=access['user_id'])

    return user


def generate_tokens(mainuser: MainUser) -> dict:
    refresh = RefreshToken.for_user(mainuser)

    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


def get_active_users_by_filter(request: ASGIRequest, active_users=MainUser.objects.filter(is_active=True),
                               show_me=False) -> QuerySet:
    """Получить всех активных пользователей по фильтру"""

    mainuser = None

    if is_authenticated(request):
        mainuser = get_user_by_token(request.COOKIES['access'])
        if show_me is False:
            active_users = active_users.exclude(id=mainuser.id)

    if request.method == 'POST':
        data = request.POST
        search_keyword = data['search_keyword']

        if search_keyword is not None:
            r = Q(username__icontains=search_keyword) | Q(first_name__icontains=search_keyword) | \
                Q(last_name__icontains=search_keyword) | Q(email__icontains=search_keyword)
            active_users = active_users.filter(r)

        try:
            if data['is_online']:
                active_users = active_users.filter(is_online=True)

            if mainuser is None:
                return active_users
        except MultiValueDictKeyError:
            pass

        try:
            if data['is_friend'] == 'on':
                friends = mainuser.get_friends()
                ids_filtered_users = []
                for friend in friends:
                    for active_user in active_users:
                        if friend == active_user:
                            ids_filtered_users.append(friend.id)
                return MainUser.objects.filter(id__in=ids_filtered_users)

        except MultiValueDictKeyError:
            pass
        except KeyError:
            pass

    return active_users


def create_or_delete_or_accept_friend_request(request_from: MainUser, username_of_request_to: MainUser) -> str:
    """Создать|удалить|принять запрос на дружбу"""

    request_to = MainUser.objects.get(username=username_of_request_to)

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
            request.is_active = True
            request.save()

            return "Вы приняли запрос на дружбу."
    except FriendRequest.DoesNotExist:
        # Отправить запрос на дружбу

        FriendRequest.objects.create(request_from=request_from, request_to=request_to)

        return "Вы отправили запрос на дружбу."


def has_user_access_to_view_data_of_another_user(mainuser: MainUser, viewer: MainUser) -> bool:
    """Имеет ли пользователь просматривать данные mainuser"""

    if mainuser == viewer:
        return True

    if mainuser.is_private and viewer not in mainuser.get_friends():
        return False

    return True


def create_message(sent_from: MainUser, interlocutor: str, message: str) -> (Message, str):
    """Создать сообщение"""

    sent_to = MainUser.objects.get(username=interlocutor)

    if len(message) < 256:
        message = Message.objects.create(text=message, sent_from=sent_from, sent_to=sent_to)
        return message
    else:
        return 'Максимальное количество знаков - 256'


def get_last_messages_with_every_user(current_user: MainUser) -> QuerySet:
    """Получить последние сообщения с каждым пользователем"""

    all_users = MainUser.objects.all()
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

    return settings.ALLOWED_HOSTS[0] + ':8000' if settings.ALLOWED_HOSTS[0] == '127.0.0.1'\
        else settings.ALLOWED_HOSTS[0]
