from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MainUser, Game
from .services import get_user_data_json
from . import serializers


class MainUsersListAPIView(generics.ListAPIView):
    """Список пользователей"""

    serializer_class = serializers.MainUsersListSerializer
    queryset = MainUser.objects.filter(is_active=True)


class MainUserProfileAPIView(APIView):
    """Профиль пользователя"""

    def get(self, request, *args, **kwargs):
        username = kwargs.get('username')
        mainuser = MainUser.objects.get(username=username)
        user_data_json = get_user_data_json(mainuser)
        return Response(
            user_data_json,
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
