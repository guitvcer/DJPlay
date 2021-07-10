from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from rest_framework import serializers
from .models import MainUser, Game
from .services import generate_tokens


class MainUserInfoSerializer(serializers.ModelSerializer):
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
            self.mainuser = MainUser.objects.get(username=attrs['username'])
        except MainUser.DoesNotExist:
            raise serializers.ValidationError('Неверные имя пользователя и/или пароль.')

        if self.mainuser.check_password(attrs['password']):
            return attrs

        raise serializers.ValidationError('Неверные имя пользователя и/или пароль.')

    def get_tokens(self):
        return generate_tokens(self.mainuser)


class RegistrationSerializer(serializers.Serializer):
    """Serializer регистрациия пользователя"""

    username = serializers.CharField(required=True)
    password1 = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)
    email = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            MainUser.objects.get(username=attrs['username'])
            raise serializers.ValidationError('Пользователь с таким именем уже существует.')
        except MainUser.DoesNotExist:
            validate_password(attrs['password1'])

            if attrs['password1'] != attrs['password2']:
                raise serializers.ValidationError('Пароли не совпадают.')

            validate_email(attrs['email'])

            try:
                MainUser.objects.get(email=attrs['email'])
                raise serializers.ValidationError('Пользователь с такой эл. почтой уже существует.')
            except MainUser.DoesNotExist:
                return attrs

    def save(self):
        mainuser = MainUser.objects.create(
            username=self.validated_data['username'],
            email=self.validated_data['email']
        )
        mainuser.set_password(self.validated_data['password1'])
        mainuser.save()

        return mainuser


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
