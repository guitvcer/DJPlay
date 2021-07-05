import json
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import MainUser
from .serializers import MainUserSerializer, MessageSerializer
from .services import (
    get_last_messages_with_every_user,
    search_messages,
)


class ChatUserAPIView(APIView):
    """API для чата с определенным пользователем"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request, user_id):
        interlocutor = MainUser.objects.get(id=user_id)
        messages_queryset = interlocutor.get_messages(request.user)
        serializer = MessageSerializer(messages_queryset, many=True)
        data = json.dumps(serializer.data)
        data = json.loads(data)
        data.append({
            'interlocutor': interlocutor.username,
            'avatar': interlocutor.avatar.url,
            'link': interlocutor.get_absolute_url(),
        })

        return Response(data)


class ChatUsersAPIView(APIView):
    """Получить последние сообщения со всех чатов для блока с пользователями слева"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request):
        messages_queryset = get_last_messages_with_every_user(request.user)

        if not messages:
            return Response([])
        else:
            serializer = MessageSerializer(messages_queryset, many=True)
            return Response(serializer.data)


class ChatSearchAPIView(APIView):
    """API поиска сообщений"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request):
        keyword = request.GET.get('q')
        messages_queryset = search_messages(keyword, request.user.get_messages())
        serializer = MessageSerializer(messages_queryset, many=True)

        return Response(serializer.data)


class UserAPIView(APIView):
    """API возвращающий данные о пользователе по id"""

    @staticmethod
    def get(request):
        user_id = request.GET.get('id')
        user = MainUser.objects.get(id=user_id)

        if user.is_private:
            return Response([user.id, user.username, user.is_private])

        serializer = MainUserSerializer(user)

        return Response(serializer.data)
