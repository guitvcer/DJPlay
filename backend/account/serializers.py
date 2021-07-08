from rest_framework import serializers
from .models import MainUser, Game
from .services import generate_tokens


class MainUsersListSerializer(serializers.ModelSerializer):
    """Serializer cписка пользователей"""

    class Meta:
        model = MainUser
        fields = ('username', 'avatar')


class AuthorizationSerializer(serializers.Serializer):
    """Serializer авторизации пользоватлея"""

    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            mainuser = MainUser.objects.get(username=attrs['username'])
        except MainUser.DoesNotExist:
            raise serializers.ValidationError('Неверные имя пользователя и/или пароль.')

        if mainuser.check_password(attrs['password']):
            return attrs

        raise serializers.ValidationError('Неверные имя пользователя и/или пароль.')

    def get_tokens(self):
        return generate_tokens(self.mainuser)


class GameSerializer(serializers.ModelSerializer):
    """Serializer игр"""

    class Meta:
        model = Game
        fields = ('name', 'app_name', 'rules', 'image', 'is_released')


class MainUserProfileSerializer(serializers.ModelSerializer):
    """Serializer профиля пользователя"""

    class Meta:
        model = MainUser
        exclude = ('password', 'groups', 'user_permissions', 'is_staff')
