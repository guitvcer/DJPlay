from rest_framework.generics import ListAPIView, get_object_or_404, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from account.models import User
from .serializers import ChatSerializer, ChatListSerializer
from .services import get_or_create_chat


class ChatListAPIView(ListAPIView):
    """Список чатов с их последними сообщениями"""

    permission_classes = (IsAuthenticated, )
    serializer_class = ChatListSerializer

    def get_queryset(self):
        return self.request.user.get_chats()


class ChatAPIView(RetrieveAPIView):
    """API определенного чата"""

    permission_classes = (IsAuthenticated, )
    serializer_class = ChatSerializer

    def get_object(self):
        username = self.kwargs.get('username')
        interlocutor = get_object_or_404(User, username=username)
        chat = get_or_create_chat(self.request.user, interlocutor)

        return chat
