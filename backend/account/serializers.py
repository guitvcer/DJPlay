from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from drf_recaptcha.fields import ReCaptchaV3Field
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from chat.services import get_or_create_chat
from .models import User, Game
from .services import generate_tokens


class UserInfoSerializer(serializers.ModelSerializer):
    """Serializer cписка пользователей"""

    class Meta:
        model = User
        fields = ('id', 'username', 'avatar', 'is_online', 'last_online', 'gender')


class AuthorizationSerializer(serializers.Serializer):
    """Serializer авторизации пользователя"""

    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    recaptcha = ReCaptchaV3Field(action='authorization')

    def validate(self, attrs):
        super().validate(attrs)

        error_text = 'Неверные имя пользователя и/или пароль.'

        try:
            self.user = User.objects.get(username=attrs['username'])

            if not self.user.is_active:
                raise serializers.ValidationError(error_text)
        except User.DoesNotExist:
            raise serializers.ValidationError(error_text)

        if not self.user.check_password(attrs['password']):
            raise serializers.ValidationError(error_text)

        return attrs

    def get_tokens(self):
        return generate_tokens(self.user)


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer регистрациия пользователя"""

    password_1 = serializers.CharField(required=True)
    password_2 = serializers.CharField(required=True)
    recaptcha = ReCaptchaV3Field(action='registration')

    def validate(self, attrs):
        super().validate(attrs)

        try:
            User.objects.get(username=attrs['username'])
            raise serializers.ValidationError('Пользователь с таким именем уже существует.')
        except User.DoesNotExist:
            if attrs['username'] in ('authorization', 'registration', 'games', 'users', 'edit', 'change-password',
                                     'delete', 'friends', 'views', 'party-list', 'google-oauth2', 'vk-oauth2', 'Гость'):
                raise serializers.ValidationError('Имя пользователя совпадает с ключевой фразой.')

            validate_password(attrs['password_1'])

            if attrs['password_1'] != attrs['password_2']:
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
        user.set_password(self.validated_data['password_1'])
        user.save()

        get_or_create_chat(user, user)

        return generate_tokens(user)

    class Meta:
        model = User
        fields = ('username', 'email', 'password_1', 'password_2', 'recaptcha')


class GameSerializer(serializers.ModelSerializer):
    """Serializer игр"""

    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        return obj.image.url

    class Meta:
        model = Game
        fields = ('name', 'app_name', 'rules', 'image', 'is_released')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer профиля пользователя"""

    class Meta:
        model = User
        exclude = ('password', 'groups', 'user_permissions', 'is_staff')


class UserProfileEditSerializer(serializers.ModelSerializer):
    """Serializer редактирования провиля пользователя"""

    avatar = serializers.FileField(required=False)
    clear_avatar = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'birthday', 'gender', 'is_private', 'avatar',
                  'clear_avatar')

    def validate(self, attrs):
        if attrs.get('clear_avatar'):
            self.instance.avatar = '/avatars/user.png'

        return super().validate(attrs)


class UserChangePasswordSerializer(serializers.Serializer):
    """Serializer смены пароль пользователя"""

    old_password = serializers.CharField(required=True)
    password_1 = serializers.CharField(required=True)
    password_2 = serializers.CharField(required=True)

    def validate(self, attrs):
        old_password = attrs['old_password']
        password_1 = attrs['password_1']
        password_2 = attrs['password_2']

        if not self.instance.check_password(old_password):
            raise serializers.ValidationError('Введен неверный старый пароль.')

        if old_password == password_1:
            raise serializers.ValidationError('Вы ввели старый пароль.')

        validate_password(password_1)

        if password_1 != password_2:
            raise serializers.ValidationError('Пароли не совпадают.')

        return attrs

    def save(self):
        self.instance.set_password(self.validated_data['password_1'])
        self.instance.save()


class UserDeleteSerializer(serializers.Serializer):
    """Serializer для удаления аккаунта пользователя"""

    password = serializers.CharField(required=True)

    def validate(self, attrs):
        if self.instance.check_password(attrs['password']):
            return attrs

        raise serializers.ValidationError('Введен неверный пароль.')

    def delete(self):
        self.instance.is_active = False
        self.instance.save()


class RefreshTokenSerializer(serializers.Serializer):
    """Serializer для обновления access_token по refresh_token"""

    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            refresh = RefreshToken(attrs['refresh'])
            self.access = str(refresh.access_token)
        except TokenError:
            raise serializers.ValidationError('Данные авторизации устарели.')

        return attrs

    def save(self):
        return {
            'access': self.access
        }
