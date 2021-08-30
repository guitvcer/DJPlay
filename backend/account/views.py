from django.conf import settings
from rest_framework import status
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from gomoku.serializers import GomokuPartyListSerializer
from .models import Game
from .services import (
    add_user_view,
    create_or_delete_or_accept_friend_request,
    get_active_users_by_filter,
    get_specific_or_current_user_info,
    get_specific_or_current_users_party_list,
    get_users_list_or_403,
    google_authorization,
    vk_authorization
)
from . import serializers


class GamesListAPIView(ListAPIView):
    """Список игр"""

    serializer_class = serializers.GameSerializer

    def get_queryset(self):
        if settings.DEBUG:
            return Game.objects.all()

        return Game.objects.filter(is_released=True)


class UsersListAPIView(APIView):
    """Список пользователей"""

    @staticmethod
    def get(request, username=None):
        users_list = get_users_list_or_403(request, username)
        serializer = serializers.UserInfoSerializer(users_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        users_list = get_active_users_by_filter(request)
        serializer = serializers.UserInfoSerializer(users_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileAPIView(APIView):
    """Профиль пользователя"""

    @staticmethod
    def get(request, *args, **kwargs):
        username = kwargs.get('username')
        user_data, user = get_specific_or_current_user_info(request, username, serializers.UserProfileSerializer)
        add_user_view(request, user)
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


class UserFriendRequest(APIView):
    """Запрос на дружбу"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request, *args, **kwargs):
        return Response({
            'title': create_or_delete_or_accept_friend_request(request.user, kwargs.get('username'))
        }, status=status.HTTP_200_OK)


class UserPartyList(APIView):
    """Список сыгранных партии пользователя"""

    @staticmethod
    def get(request, *args, **kwargs):
        game = get_object_or_404(Game.objects.all(), app_name=kwargs.get('game_name'))
        user_party_list = get_specific_or_current_users_party_list(request, kwargs.get('username'), game)
        serializer = GomokuPartyListSerializer(user_party_list, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


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
            credentials = google_authorization(request.data.get('code'))
        elif provider == 'VK':
            credentials = vk_authorization(request.data.get('access_token'))
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(credentials, status=status.HTTP_200_OK)
