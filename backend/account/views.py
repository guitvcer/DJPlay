from django.conf import settings
from django.urls import resolve
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MainUser, Game
from .services import get_user_by_token
from . import serializers


class MainUsersListAPIView(APIView):
    """Список пользователей"""

    def get(self, request, username=None):
        urlname = resolve(self.request.path_info).url_name

        if urlname == 'users_friends' or urlname == 'users_views':
            try:
                mainuser = MainUser.objects.get(username=username)
            except MainUser.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            else:
                if mainuser.is_private:
                    return Response(status=status.HTTP_403_FORBIDDEN)

                if urlname == 'users_friends':
                    users_list = mainuser.get_friends()
                elif urlname == 'users_views':
                    users_list = mainuser.get_views()
        else:
            users_list = MainUser.objects.filter(is_active=True)

        serializer = serializers.MainUserInfoSerializer(users_list, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class MainUserProfileAPIView(APIView):
    """Профиль пользователя"""

    def get(self, request, *args, **kwargs):
        username = kwargs.get('username')

        try:
            mainuser = MainUser.objects.get(username=username)
        except MainUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            if mainuser.is_private:
                data = {
                    'username': mainuser.username,
                    'is_private': mainuser.is_private,
                    'avatar': str(mainuser.avatar)
                }
            else:
                serializer = serializers.MainUserProfileSerializer(mainuser)
                data = {
                    'friends': mainuser.get_friends().count(),
                    'views': mainuser.get_views().count()
                }
                data.update(serializer.data)

            return Response(
                data,
                status=status.HTTP_200_OK
            )


class AuthorizationAPIView(APIView):
    """Авторизация"""

    def post(self, request, *args, **kwargs):
        serializer = serializers.AuthorizationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            return Response(serializer.get_tokens(), status=status.HTTP_200_OK)


class GamesListAPIView(generics.ListAPIView):
    """Список игр"""

    serializer_class = serializers.GameSerializer

    def get_queryset(self):
        if settings.DEBUG:
            return Game.objects.all()

        return Game.objects.filter(is_released=True)


class CurrentMainUserInfoAPIView(APIView):
    """Информация о текущем пользователе"""

    def get(self, request, *args, **kwargs):
        access_token = request.headers['Authorization'].split(' ')[1]
        mainuser = get_user_by_token(access_token)
        serializer = serializers.MainUserInfoSerializer(mainuser)

        return Response(serializer.data, status=status.HTTP_200_OK)
