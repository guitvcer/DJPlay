from django.conf import settings
from django.urls import resolve
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Game
from .services import (
    has_user_access_to_view_data_of_another_user,
    get_user_profile_info
)
from . import serializers


class GamesListAPIView(generics.ListAPIView):
    """Список игр"""

    serializer_class = serializers.GameSerializer

    def get_queryset(self):
        if settings.DEBUG:
            return Game.objects.all()

        return Game.objects.filter(is_released=True)


class UsersListAPIView(APIView):
    """Список пользователей"""

    def get(self, request, username=None):
        urlname = resolve(self.request.path_info).url_name
        users_list = None

        if urlname == 'users_friends' or urlname == 'users_views':
            try:
                user = User.objects.get(username=username)  # пользователь чьи друзья/просмотры возвращаются
            except User.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            if has_user_access_to_view_data_of_another_user(user, request):
                if urlname == 'users_friends':
                    users_list = user.get_friends()
                elif urlname == 'users_views':
                    users_list = user.get_views()
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            users_list = User.objects.filter(is_active=True)

        serializer = serializers.UserInfoSerializer(users_list, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileAPIView(APIView):
    """Профиль пользователя"""

    def get(self, request, *args, **kwargs):
        username = kwargs.get('username')

        # получить информацию определенного пользователя
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            return Response(
                get_user_profile_info(user, request, serializers.UserProfileSerializer),
                status=status.HTTP_200_OK
            )

        # получить информацию о текущем пользователе
        if request.user.is_authenticated:
            serializer = serializers.UserProfileEditSerializer(request.user)

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class UserProfileEditAPIView(APIView):
    """Изменить профиль пользователя"""

    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        serializer = serializers.UserProfileEditSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({
                'title': 'Вы успешно обновили профиль.'
            }, status=status.HTTP_200_OK)


class UserChangePasswordAPIView(APIView):
    """Смена пароля пользователя"""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = serializers.UserChangePasswordSerializer(data=request.data, context={'user': request.user})

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({
                'title': 'Вы успешно сменили пароль.'
            }, status=status.HTTP_200_OK)


class AuthorizationAPIView(APIView):
    """Авторизация пользователя"""

    def post(self, request, *args, **kwargs):
        serializer = serializers.AuthorizationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            return Response(serializer.get_tokens(), status=status.HTTP_200_OK)


class RegistrationAPIView(APIView):
    """Регистрация пользователя"""

    def post(self, request, *args, **kwargs):
        serializer = serializers.RegistrationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            return Response(serializer.save(), status=status.HTTP_201_CREATED)
