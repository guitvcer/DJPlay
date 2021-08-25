from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from account.models import User
from .serializers import ChatSerializer, ChatListSerializer
from .services import get_chat


class ChatListAPIView(ListAPIView):
    """Список чатов с их последними сообщениями"""

    permission_classes = (IsAuthenticated, )
    serializer_class = ChatListSerializer

    def get_queryset(self):
        return self.request.user.get_chats()


class ChatAPIView(APIView):
    """API определенного чата"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request, *args, **kwargs):
        username = kwargs.get('username')
        interlocutor = get_object_or_404(User, username=username)
        chat = get_chat(request.user, interlocutor)
        serializer = ChatSerializer(chat)

        return Response(serializer.data, status=HTTP_200_OK)
