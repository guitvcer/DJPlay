import os
import requests
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.db.models.query import QuerySet
from django.urls import resolve
from rest_framework.exceptions import (
    PermissionDenied,
    NotAuthenticated,
    ParseError,
    NotFound,
    AuthenticationFailed
)
from rest_framework.generics import get_object_or_404
from rest_framework.serializers import SerializerMetaclass
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from chat.services import get_or_create_chat
from .exceptions import Gone
from .models import User, FriendRequest, Game, UserView


def get_user_by_token(access_token: str) -> User:
    """Получить пользователя по токену"""

    try:
        access = AccessToken(access_token)
        user = User.objects.get(id=access["user_id"])

        return user
    except TokenError:
        raise AuthenticationFailed


def generate_tokens(user: User) -> dict:
    refresh = RefreshToken.for_user(user)

    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def get_active_users_by_filter(
        post_data: dict,
        user: (User, AnonymousUser),
        path_info: str = None,
        username: str = None
) -> QuerySet:
    """Отфильтровать пользователей"""

    query = post_data.get("query")

    if path_info is None:
        active_users = User.active.all()
    else:
        active_users = get_users_list_or_403(path_info, username, user)

    if query is not None:
        r = Q(username__icontains=query) | Q(first_name__icontains=query) | \
            Q(last_name__icontains=query) | Q(email__icontains=query)
        active_users = active_users.filter(r)

    if post_data.get("is_online"):
        active_users = active_users.filter(is_online=True)

    if user.is_authenticated:
        if post_data.get("is_friend"):
            friends = user.get_friends()
            ids_filtered_users = []

            for friend in friends:
                for active_user in active_users:
                    if friend == active_user:
                        ids_filtered_users.append(friend.id)

            return User.objects.filter(id__in=ids_filtered_users)

    return active_users


def create_or_delete_or_accept_friend_request(request_from: User, request_to: User) -> str:
    """Создать|удалить|принять запрос на дружбу"""

    if request_from == request_to:
        raise ParseError

    try:
        try:
            # Отменить запрос на дружбу

            message = "Вы отменили запрос на дружбу."
            request = FriendRequest.objects.get(request_from=request_from, request_to=request_to)

            if request.is_active:
                message = "Вы удалили пользователя из друзей."

            request.delete()
        except FriendRequest.DoesNotExist:
            # Принять/удалить запрос на дружбу

            request = FriendRequest.objects.get(
                request_from=request_to,
                request_to=request_from)

            if request.is_active:
                message = "Вы удалили пользователя из друзей."
            else:
                message = "Вы приняли запрос на дружбу."

            request.is_active = not request.is_active
            request.save()
    except FriendRequest.DoesNotExist:
        # Отправить запрос на дружбу

        FriendRequest.objects.create(request_from=request_from, request_to=request_to)
        message = "Вы отправили запрос на дружбу."

    return message


def get_user_profile_info(user: User, current_user: User, serializer: SerializerMetaclass) -> dict:
    """Получить информацию о пользователе"""

    if user.has_access_to_view_data_of_another_user(current_user):
        data = {
            "views": user.get_viewers().count()
        }
        data.update(serializer(user).data)

        if current_user == user:
            data["is_me"] = True
    else:
        data = {
            "username": user.username,
            "is_private": user.is_private,
            "avatar": user.avatar.url
        }

    if data.get("is_me") is None and current_user.is_authenticated:
        try:
            friend_request = FriendRequest.objects.get(request_from=user, request_to=current_user)

            if friend_request.is_active:
                data["friend_request"] = "accepted"
            else:
                data["friend_request"] = "got"
        except FriendRequest.DoesNotExist:
            try:
                friend_request = FriendRequest.objects.get(request_from=current_user, request_to=user)

                if friend_request.is_active:
                    data["friend_request"] = "accepted"
                else:
                    data["friend_request"] = "sent"
            except FriendRequest.DoesNotExist:
                data["friend_request"] = False

    data["friends"] = user.get_friends().count()

    return data


def get_users_friends_or_views(url_name: str, user: User) -> (QuerySet, None):
    """Получить друзей/просмотры пользователя по адресу"""

    if url_name in ("users_friends", "friends"):
        return user.get_friends()
    elif url_name in ("users_views", "views"):
        return user.get_viewers()


def get_users_list_or_403(path_info: str, username: str, user: User) -> QuerySet:
    """Получить список пользователей"""

    url_name = resolve(path_info).url_name

    if url_name in ("users_friends", "users_views", "friends", "views"):
        if username is None:
            user = user
        else:
            user = get_object_or_404(User.objects.all(), username=username)

        if user.has_access_to_view_data_of_another_user(user):
            return get_users_friends_or_views(url_name, user)
        else:
            raise PermissionDenied

    return User.active.all()


def get_specific_or_current_user_info(
        current_user: (User, AnonymousUser),
        username: str,
        serializer: SerializerMetaclass
) -> (dict, User):
    """Получить информацию об определенного или текущего пользователя"""

    # получить информацию определенного пользователя
    if username:
        user = get_object_or_404(User.objects.all(), username=username)

        # вернуть 204, если профиль не активный
        if not user.is_active:
            raise Gone

        return get_user_profile_info(user, current_user, serializer), user

    # получить информацию о текущем пользователе
    if current_user.is_authenticated:
        return get_user_profile_info(current_user, current_user, serializer), current_user

    raise NotAuthenticated


def get_specific_or_current_users_party_list(
        current_user: (User, AnonymousUser),
        username: str,
        game_name: str
) -> QuerySet:
    """Получить список сыгранных партии текущего или определенного пользователя"""

    # получить QuerySet из партии определенного пользователя
    if username:
        user = get_object_or_404(User.active.all(), username=username)

        if ((not current_user.is_authenticated) and user.is_private) or \
                (not user.has_access_to_view_data_of_another_user(current_user)):
            raise PermissionDenied

        if game_name == "gomoku":
            return user.get_gomoku_parties()
        elif game_name == "chess":
            return user.get_chess_parties()

    # получить QuerySet из партии текущего пользователя
    if current_user.is_authenticated:
        if game_name == "gomoku":
            return current_user.get_gomoku_parties()
        elif game_name == "chess":
            return current_user.get_chess_parties()

    raise NotAuthenticated


def add_user_view(current_user: (User, AnonymousUser), user: User) -> None:
    """Добавить авторизованного пользователя в список просмотров профиля определенного пользователя"""

    if current_user.is_authenticated and current_user != user and current_user not in user.get_viewers():
        UserView.objects.create(view_from=current_user, view_to=user)


def download_file_by_url(url: str, file_name: str) -> None:
    """Скачать файл по url"""

    file = requests.get(url)
    downloaded_file_absolute_url = f"{settings.BASE_DIR}/media/{file_name}"

    if not os.path.exists(downloaded_file_absolute_url):
        downloaded_file = open(downloaded_file_absolute_url, "wb")
        downloaded_file.write(file.content)
        downloaded_file.close()


def google_authorization(code: str, google_client_id: str) -> dict:
    """Получить JWT токены авторизации и создать пользователя (если нету) по токену Google"""

    if code is None or google_client_id is None:
        raise ParseError

    google_tokens = requests.post("https://www.googleapis.com/oauth2/v4/token", headers={
        "Content-Type": "application/x-www-form-urlencoded",
    }, data={
        "code": code,
        "redirect_uri": f"{settings.CORS_ALLOWED_ORIGINS[0]}/account/google-oauth2/",
        "client_id": google_client_id,
        "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH_SECRET,
        "scope": "",
        "grant_type": "authorization_code",
    })

    if google_tokens.status_code == 400:
        raise ParseError

    google_user_data = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + google_tokens.json()["access_token"]
    ).json()

    try:
        user = User.objects.get(username=google_user_data["name"])

        if not user.is_active:
            raise NotFound
    except User.DoesNotExist:
        avatar_url = f"avatars/{google_user_data['name']}.png"
        download_file_by_url(google_user_data["picture"], avatar_url)

        user = User.objects.create(
            username=google_user_data["name"],
            first_name=google_user_data["given_name"],
            last_name=google_user_data["family_name"],
            email=google_user_data["email"],
            avatar=avatar_url,
            provider="Google"
        )
        get_or_create_chat(user, user)

    return generate_tokens(user)


def vk_authorization(code: str, vk_client_id: str) -> dict:
    """Получить JWT токены авторизации и создать пользователя (если нету) по токену VK"""

    if code is None or vk_client_id is None:
        raise ParseError

    vk_tokens_response = requests.get(f"https://oauth.vk.com/access_token?client_id={vk_client_id}&"
                                      f"client_secret={settings.SOCIAL_AUTH_VK_OAUTH_SECRET}&"
                                      f"redirect_uri={settings.CORS_ALLOWED_ORIGINS[0]}/account/vk-oauth2/&code={code}")

    if vk_tokens_response.status_code == 401:
        raise ParseError

    vk_user_data_response = requests.get(
        f"https://api.vk.com/method/users.get?v=5.131&fields=screen_name,photo_max_orig,has_photo"
        f"&access_token={vk_tokens_response.json()['access_token']}")

    vk_user_data = vk_user_data_response.json()["response"][0]

    try:
        user = User.objects.get(username=vk_user_data["screen_name"])

        if not user.is_active:
            raise NotFound
    except User.DoesNotExist:
        if vk_user_data["has_photo"]:
            avatar_url = f"avatars/{vk_user_data['screen_name']}.png"
            download_file_by_url(vk_user_data["photo_max_orig"], avatar_url)
        else:
            avatar_url = "/media/avatars/user.png"

        user = User.objects.create(
            username=vk_user_data["screen_name"],
            first_name=vk_user_data["first_name"],
            last_name=vk_user_data["last_name"],
            email=vk_user_data.get("email"),
            avatar=avatar_url,
            provider="VK"
        )
        get_or_create_chat(user, user)

    return generate_tokens(user)


def get_games() -> QuerySet:
    """Получить выпущенные игры если сервер на продакшене иначе все игры"""

    if settings.DEBUG:
        return Game.objects.all()

    return Game.objects.filter(is_released=True)
