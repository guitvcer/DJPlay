from rest_framework import serializers
from .models import MainUser, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer модели сообщений"""

    class Meta:
        model = Message
        fields = ('id', 'sent_to', 'sent_from', 'text', 'date')


class MainUserSerializer(serializers.ModelSerializer):
    """Serializer пользователя"""

    class Meta:
        model = MainUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'birthday', 'gender',
                  'avatar', 'is_private', 'last_online', 'is_online')
