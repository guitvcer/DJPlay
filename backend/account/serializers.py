from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from rest_framework import serializers
from .models import User, Game
from .services import generate_tokens


class UserInfoSerializer(serializers.ModelSerializer):
    """Serializer cписка пользователей"""

    class Meta:
        model = User
        fields = ('username', 'avatar')


class AuthorizationSerializer(serializers.Serializer):
    """Serializer авторизации пользователя"""

    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            self.user = User.objects.get(username=attrs['username'])
        except User.DoesNotExist:
            raise serializers.ValidationError('Неверные имя пользователя и/или пароль.')

        if self.user.check_password(attrs['password']):
            return attrs

        raise serializers.ValidationError('Неверные имя пользователя и/или пароль.')

    def get_tokens(self):
        return generate_tokens(self.user)


class RegistrationSerializer(serializers.Serializer):
    """Serializer регистрациия пользователя"""

    username = serializers.CharField(required=True)
    password1 = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)
    email = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            User.objects.get(username=attrs['username'])
            raise serializers.ValidationError('Пользователь с таким именем уже существует.')
        except User.DoesNotExist:
            validate_password(attrs['password1'])

            if attrs['password1'] != attrs['password2']:
                raise serializers.ValidationError('Пароли не совпадают.')

            validate_email(attrs['email'])

            try:
                User.objects.get(email=attrs['email'])
                raise serializers.ValidationError('Пользователь с такой эл. почтой уже существует.')
            except User.DoesNotExist:
                return attrs

    def save(self):
        user = User.objects.create(
            username=self.validated_data['username'],
            email=self.validated_data['email']
        )
        user.set_password(self.validated_data['password1'])
        user.save()

        return generate_tokens(user)


class GameSerializer(serializers.ModelSerializer):
    """Serializer игр"""

    class Meta:
        model = Game
        fields = ('name', 'app_name', 'rules', 'image', 'is_released')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer профиля пользователя"""

    class Meta:
        model = User
        exclude = ('password', 'groups', 'user_permissions', 'is_staff')
