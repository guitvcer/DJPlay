from rest_framework import serializers
from .models import MainUser


class MainUsersListSerializer(serializers.ModelSerializer):
    """Serializer cписка пользователей"""

    class Meta:
        model = MainUser
        fields = ('username', 'avatar')


class MainUserProfileSerializer(serializers.ModelSerializer):
    """Serializer профиля пользователя"""

    class Meta:
        model = MainUser
        fields = (
            'avatar',
            'is_online',
            'last_online',
            'username',
            'email',
            'gender',
            'birthday',
            'date_joined',
            'first_name',
            'last_name'
        )
