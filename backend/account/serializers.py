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

    password1 = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

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
            self.instance.avatar = '/user.png'

        return super().validate(attrs)


class UserChangePasswordSerializer(serializers.Serializer):
    """Serializer смены пароль пользователя"""

    oldpassword = serializers.CharField(required=True)
    password1 = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        self.user = self.context.get('user')
        oldpassword = attrs['oldpassword']
        password1 = attrs['password1']
        password2 = attrs['password2']

        if not self.user.check_password(oldpassword):
            raise serializers.ValidationError('Введен неверный старый пароль.')

        if oldpassword == password1:
            raise serializers.ValidationError('Вы ввели старый пароль.')

        validate_password(password1)

        if password1 != password2:
            raise serializers.ValidationError('Пароли не совпадают.')

        self.user.set_password(password1)
        self.user.save()

        return attrs

    def save(self):
        self.user.set_password(self.validated_data['password1'])
        self.user.save()


class UserDeleteSerializer(serializers.Serializer):
    """Serializer для удаления аккаунта пользователя"""

    password = serializers.CharField(required=True)

    def validate(self, attrs):
        if self.context.get('user').check_password(attrs['password']):
            return attrs

        raise serializers.ValidationError('Введен неверный пароль.')

    def delete(self):
        self.context.get('user').is_active = False
        self.context.get('user').save()
