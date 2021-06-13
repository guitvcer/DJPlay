import random
from django.core.handlers.asgi import ASGIRequest
from django.db.models import Q
from django.db.models.query import QuerySet
from django.http.response import HttpResponseRedirect
from django.shortcuts import redirect
from django.utils.datastructures import MultiValueDictKeyError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError
from chess.models import Party as ChessParty
from gomoku.models import Party as GomokuParty
from .models import MainUser, FriendRequest, Message, Queue, Game


def check_username(username: str) -> bool:
    return " " in username


def is_mainuser_exists(username: str) -> bool:
    """Проверка на существования конкретного пользователя"""

    return MainUser.objects.filter(username=username).exists()


def is_password_valid(password: str) -> bool:
    """Валидация пароля"""

    return len(password) >= 8


def is_email_exists(email: str) -> bool:
    """Существует ли этот email"""

    return MainUser.objects.filter(email=email).exists()


def is_authenticated(request: ASGIRequest) -> bool:
    """Авторизован ли пользователь"""

    result = 'access' in request.COOKIES

    try:
        if result:
            AccessToken(request.COOKIES['access'])
    except TokenError:
        return False

    return result


def get_user_by_token(access_token: str, refresh_token=None) -> MainUser:
    """Получить пользователя по токену"""

    try:
        access = AccessToken(access_token)
        user = MainUser.objects.get(id=access['user_id'])

        return user
    except TokenError:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token
        refresh.set_jti()
        refresh.set_exp()

        return logout_mainuser()


def update_mainuser(data: dict, user: MainUser) -> (str, bool):
    """Обновление данных о пользователе"""

    username = data['username']
    email = data['email']
    birthday = data['birthday']
    first_name = data['first_name']
    last_name = data['last_name']
    gender = data['gender']
    is_private = data.get('is_private', False)
    avatar = data.get('avatar', False)
    clear_image = data['clear_image']

    if is_mainuser_exists(username) and user.username != username:
        return "Это имя пользователя уже занято."

    if is_email_exists(email) and user.email != email:
        return "Эту эл.почту уже использует другой пользователь."

    user.username = username
    user.email = email

    if birthday != "":
        user.birthday = birthday

    user.first_name = first_name
    user.last_name = last_name
    user.gender = gender

    if clear_image == 'on':
        user.avatar = '/user.png'
    elif avatar != "" and avatar is not False:
        user.avatar = avatar

    if is_private == 'on':
        user.is_private = True
    else:
        user.is_private = False

    user.save()

    return True


def generate_tokens(mainuser: MainUser) -> dict:
    refresh = RefreshToken.for_user(mainuser)

    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


def authorize_user(username: str, password: str) -> (str, dict):
    """Авторизовать пользователя по логину/паролю"""

    error = 'Неверные имя пользователя и/или пароль.'

    if not is_mainuser_exists(username):
        return error

    mainuser = MainUser.objects.get(username=username)

    if mainuser.is_active is False:
        return 'Ваш профиль был удален.'

    if not mainuser.check_password(password):
        return error

    refresh = RefreshToken.for_user(mainuser)

    data = {'access': str(refresh.access_token), 'refresh': str(refresh)}

    return data


def get_active_users_by_filter(request: ASGIRequest) -> QuerySet:
    """Получить всех активных пользователей по фильтру"""

    active_users = MainUser.objects.filter(is_active=True)
    mainuser = None

    if is_authenticated(request):
        mainuser = get_user_by_token(request.COOKIES['access'])
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
                filtered_users = []
                for friend in friends:
                    for active_user in active_users:
                        if friend == active_user:
                            filtered_users.append(friend)
                return filtered_users

        except MultiValueDictKeyError:
            pass
        except KeyError:
            pass

    return active_users


def logout_mainuser() -> HttpResponseRedirect:
    """Выйти из аккаунта"""

    response = redirect('/')
    response.delete_cookie('access')
    response.delete_cookie('refresh')
    return response


def delete_mainuser(user: MainUser, password: str) -> (bool, str):
    """Перевести поле пользователя is_active на False проверив пароль"""

    if user.check_password(password):
        user.is_active = False
        user.save()
        return True
    else:
        return "Неверный пароль."


def change_password_of_user(user: MainUser, data: dict) -> (bool, str):
    """Сменить пароль пользователю"""

    old_password = data['old_password']
    password1 = data['password1']
    password2 = data['password2']

    if not user.check_password(old_password):
        return "Введен неверный старый пароль."

    if not is_password_valid(password1):
        return "<ul>Пароль должен:" \
               "<li>иметь хотя бы одно число</li>" \
               "<li>иметь хотя бы по одной букве нижнего и верхнего регистра</li>" \
               "<li>иметь хотя бы один специальный символ (@#$%^&+=.)</li>" \
               "<li>быть длиной от 8 символов.</li></ul>"

    if password1 != password2:
        return "Пароли не совпадают."

    user.set_password(password1)
    user.save()

    return True


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


def has_user_access_to_view_data_of_mainuser(mainuser: MainUser, request: ASGIRequest) -> bool:
    """Имеет ли пользователь просматривать данные mainuser"""

    if is_authenticated(request):

        user = get_user_by_token(request.COOKIES['access'])

        if mainuser == user:
            return True

        if mainuser.is_private and user not in mainuser.get_friends():
            return False
    else:
        if mainuser.is_private:
            return False


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
