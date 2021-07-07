from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MainUser
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
