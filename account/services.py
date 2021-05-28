from django.db.models import Q
from django.shortcuts import redirect
from django.utils.datastructures import MultiValueDictKeyError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError
from .models import Message

from .models import MainUser, FriendRequest


def check_username(username):
    return " " in username


def is_mainuser_exists(username):
    """Проверка на существования конкретного пользователя"""

    return MainUser.objects.filter(username=username).exists()


def is_password_valid(password):
    """Валидация пароля"""

    return len(password) >= 8


def is_email_exists(email):
    """Существует ли этот email"""

    return MainUser.objects.filter(email=email).exists()


def create_mainuser(data):
    """Создать основного пользователя"""

    username = data['username']
    password1 = data['password1']
    password2 = data['password2']
    email = data['email']

    if is_mainuser_exists(username):
        return "Пользователь уже существует."

    if check_username(username):
        return "Введен недопустимый символ в имени пользователя."

    if not is_password_valid(password1):
        return "<ul>Пароль должен быть от 8 символов."

    if password1 != password2:
        return "Пароли не совпадают."

    if is_email_exists(email):
        return "Пользователь с этой эл. почтой уже существует."

    mainuser = MainUser.objects.create_user(username, email, password1)
    mainuser.save()

    return True


def is_authenticated(request):
    """Авторизован ли пользователь"""

    result = 'access' in request.COOKIES

    try:
        if result:
            AccessToken(request.COOKIES['access'])
    except TokenError:
        return False

    return result


def get_user_by_token(access_token, refresh_token=None):
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


def update_mainuser(data, user):
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


def authorize_user(username, password):
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


def get_active_users_by_filter(request):
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


def logout_mainuser():
    """Выйти из аккаунта"""

    response = redirect('/')
    response.delete_cookie('access')
    response.delete_cookie('refresh')
    return response


def delete_mainuser(user, password):
    """Перевести поле пользователя is_active на False проверив пароль"""

    if user.check_password(password):
        user.is_active = False
        user.save()
        return True
    else:
        return "Неверный пароль."


def change_password_of_user(user, data):
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


def create_or_delete_or_accept_friend_request(request_from, username_of_request_to):
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


def has_user_access_to_view_data_of_mainuser(mainuser, request):
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


def create_message(sent_from, interlocutor, message):
    """Создать сообщение"""

    sent_to = MainUser.objects.get(username=interlocutor)

    if len(message) < 256:
        message = Message.objects.create(text=message, sent_from=sent_from, sent_to=sent_to)
        return message
    else:
        return 'Максимальное количество знаков - 256'


def get_last_messages_with_every_user(current_user):
    """Получить последние сообщения с каждым пользователем"""

    all_users = MainUser.objects.all()
    list_of_ids = []

    for user in all_users:
        messages = current_user.get_messages(user)

        if messages.count() > 0:
            list_of_ids.append(messages.last().id)

    messages = Message.objects.filter(id__in=list_of_ids)

    return messages


def search_messages(keyword, messages=Message.objects.all()):
    """Искать сообщение"""

    return messages.filter(Q(text__icontains=keyword))
