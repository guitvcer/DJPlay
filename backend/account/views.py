from rest_framework import status
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from gomoku.serializers import GomokuPartyListSerializer
from .models import User
from .paginations import PartyListPagination
from .services import (
    add_user_view,
    create_or_delete_or_accept_friend_request,
    get_active_users_by_filter,
    get_specific_or_current_user_info,
    get_specific_or_current_users_party_list,
    get_users_list_or_403,
    google_authorization,
    vk_authorization,
    get_games
)
from . import serializers


class GamesListAPIView(ListAPIView):
    """Список игр"""

    serializer_class = serializers.GameSerializer

    def get_queryset(self):
        return get_games()


class UsersListAPIView(APIView):
    """Список пользователей"""

    @staticmethod
    def get(request, username=None):
        users_list = get_users_list_or_403(request.path_info, username, request.user)
        serializer = serializers.UserInfoSerializer(users_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        users_list = get_active_users_by_filter(request.data, request.user, request.path_info)
        serializer = serializers.UserInfoSerializer(users_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileAPIView(APIView):
    """Профиль пользователя"""

    @staticmethod
    def get(request, *args, **kwargs):
        username = kwargs.get('username')
        user_data, user = get_specific_or_current_user_info(request.user, username, serializers.UserProfileSerializer)
        add_user_view(request.user, user)
        return Response(user_data, status=status.HTTP_200_OK)


class UserProfileEditAPIView(APIView):
    """Изменить профиль пользователя"""

    parsers = (MultiPartParser, )
    permission_classes = (IsAuthenticated, )

    @staticmethod
    def patch(request, *args, **kwargs):
        serializer = serializers.UserProfileEditSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(status=status.HTTP_200_OK)


class UserChangePasswordAPIView(APIView):
    """Смена пароля пользователя"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def patch(request, *args, **kwargs):
        serializer = serializers.UserChangePasswordSerializer(request.user, data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(status=status.HTTP_200_OK)


class UserDeleteAPIView(APIView):
    """Удаление аккаунта пользователя"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def delete(request, *args, **kwargs):
        serializer = serializers.UserDeleteSerializer(request.user, data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.delete()
            return Response(status=status.HTTP_200_OK)


class UserFriendRequestAPIView(APIView):
    """Запрос на дружбу"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request, *args, **kwargs):
        request_to = get_object_or_404(User.active.all(), username=kwargs.get('username'))
        return Response({
            'title': create_or_delete_or_accept_friend_request(request.user, request_to)
        }, status=status.HTTP_200_OK)


class UserPartyListAPIView(ListAPIView):
    """Список сыгранных партии пользователя"""

    serializer_class = GomokuPartyListSerializer
    pagination_class = PartyListPagination

    def get_queryset(self):
        game = get_object_or_404(get_games(), app_name=self.kwargs.get('game_name'))
        return get_specific_or_current_users_party_list(self.request.user, self.kwargs.get('username'), game)


class AuthorizationAPIView(APIView):
    """Авторизация пользователя"""

    @staticmethod
    def post(request, *args, **kwargs):
        serializer = serializers.AuthorizationSerializer(data=request.data, context={
            'request': request
        })

        if serializer.is_valid(raise_exception=True):
            return Response(serializer.get_tokens(), status=status.HTTP_200_OK)


class RegistrationAPIView(APIView):
    """Регистрация пользователя"""

    @staticmethod
    def post(request, *args, **kwargs):
        serializer = serializers.RegistrationSerializer(data=request.data, context={
            'request': request
        })

        if serializer.is_valid(raise_exception=True):
            return Response(serializer.save(), status=status.HTTP_201_CREATED)


class SocialAuthorizationAPIView(APIView):
    """Авторизация через соц.сети"""

    @staticmethod
    def post(request, *args, **kwargs):
        provider = request.data.get('provider')

        if provider == 'Google':
            credentials = google_authorization(request.data.get('code'), request.data.get('google_client_id'))
        elif provider == 'VK':
            credentials = vk_authorization(request.data.get('access_token'))
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(credentials, status=status.HTTP_200_OK)


class RefreshTokenAPIView(APIView):
    """Получить новый access_token по старому refresh_token"""

    @staticmethod
    def post(request, *args, **kwargs):
        serializer = serializers.RefreshTokenSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            return Response(serializer.save(), status=status.HTTP_200_OK)
