from rest_framework import serializers
from account.serializers import UserInfoSerializer
from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer сообщения"""

    sent_from = UserInfoSerializer()

    class Meta:
        model = Message
        fields = "__all__"


class ChatListSerializer(serializers.ModelSerializer):
    """Serializer для списка чатов"""

    user_1 = UserInfoSerializer()
    user_2 = UserInfoSerializer()
    last_message = serializers.SerializerMethodField("get_last_message")

    @staticmethod
    def get_last_message(chat: Chat) -> dict:
        last_message = chat.message_set.last()
        serializer = MessageSerializer(last_message)

        return serializer.data

    class Meta:
        model = Chat
        fields = "__all__"


class ChatSerializer(serializers.ModelSerializer):
    """Serializer чата"""

    user_1 = UserInfoSerializer()
    user_2 = UserInfoSerializer()
    messages = serializers.SerializerMethodField("get_messages")

    @staticmethod
    def get_messages(chat: Chat) -> list:
        messages = chat.message_set.all()
        serializer = MessageSerializer(messages, many=True)

        return serializer.data

    class Meta:
        model = Chat
        fields = "__all__"
