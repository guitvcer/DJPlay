from django import forms

from . import models


class RegistrationForm(forms.ModelForm):
    """Форма регистрации пользователя"""

    username = forms.CharField(label="", max_length=32, label_suffix="",
                               widget=forms.TextInput(attrs={'placeholder': 'Имя пользователя'}))

    password1 = forms.CharField(label="", label_suffix="", widget=forms.PasswordInput(attrs={
        'placeholder': 'Пароль',
        'autocomplete': 'new-password'}))

    password2 = forms.CharField(label="", label_suffix="", widget=forms.PasswordInput(attrs={
        'placeholder': 'Пароль (повторно)',
        'autocomplete': 'new-password'}))

    email = forms.EmailField(label="", label_suffix="",
                             widget=forms.EmailInput(attrs={'placeholder': 'Эл. почта'}))

    class Meta:
        model = models.MainUser
        fields = ('username', 'password1', 'password2', 'email')


class AuthorizationForm(forms.ModelForm):
    """Форма входа в аккаунт пользователя"""

    username = forms.CharField(label="", max_length=32, label_suffix="",
                               widget=forms.TextInput(attrs={'placeholder': 'Имя пользователя'}))
    password = forms.CharField(label="", label_suffix="", widget=forms.PasswordInput(attrs={
        'placeholder': 'Пароль',
        'autocomplete': 'current-password'}))

    class Meta:
        model = models.MainUser
        fields = ('username', 'password')


class DateInput(forms.DateInput):
    """DateInput, но с типом date"""

    input_type = 'date'


class MainUserUpdateForm(forms.ModelForm):
    """Форма для обновления данных о пользователе"""

    username = forms.CharField(label="Имя пользователя", label_suffix="", max_length=32,
                               widget=forms.TextInput(attrs={'placeholder': 'Имя пользователя'}))

    first_name = forms.CharField(label="Настоящее имя", max_length=150, required=False,
                                 widget=forms.TextInput(attrs={'placeholder': 'Настоящее имя'}))

    last_name = forms.CharField(label="Настоящая фамилия", label_suffix="", max_length=150, required=False,
                                widget=forms.TextInput(attrs={'placeholder': 'Настоящая фамилия'}))

    gender = forms.ChoiceField(label="Пол", label_suffix="", required=False,
                               choices=(('M', 'Мужской'), ('F', 'Женский'), (None, 'Не указано')))

    birthday = forms.DateField(label="Дата рождения", label_suffix="", required=False,
                               widget=forms.DateInput(attrs={'placeholder': 'Дата рождения'}))

    email = forms.EmailField(label="Эл.почта", label_suffix="",
                             widget=forms.EmailInput(attrs={'placeholder': 'Эл.почта'}))

    avatar = forms.ImageField(required=False, widget=forms.FileInput(attrs={'class': 'input-file'}))

    is_private = forms.BooleanField(label="Приватный аккаунт?", label_suffix="", required=False,
                                    widget=forms.CheckboxInput(attrs={'class': 'switch'}))

    class Meta:
        model = models.MainUser
        fields = ('username', 'first_name', 'last_name', 'email', 'avatar', 'is_private')


class MainUserDeleteForm(forms.ModelForm):
    """Форма для удаления профиля"""

    password = forms.CharField(label="", label_suffix="",
                               widget=forms.PasswordInput(attrs={'placeholder': 'Введите пароль'}))

    class Meta:
        model = models.MainUser
        fields = ('password', )


class MainUserChangePasswordForm(forms.ModelForm):
    """Форма для смены пароля пользователя"""

    old_password = forms.CharField(label="", label_suffix="",
                                   widget=forms.PasswordInput(attrs={'placeholder': 'Старый пароль'}))

    password1 = forms.CharField(label="", label_suffix="",
                                   widget=forms.PasswordInput(attrs={'placeholder': 'Новый пароль'}))

    password2 = forms.CharField(label="", label_suffix="",
                                   widget=forms.PasswordInput(attrs={'placeholder': 'Повторите пароль'}))

    class Meta:
        model = models.MainUser
        fields = ('old_password', 'password1', 'password2')


class SearchMainUserForm(forms.Form):
    """Форма для поиска пользователей"""

    search_keyword = forms.CharField(label="", label_suffix="", required=False,
                                     widget=forms.TextInput(attrs={'placeholder': 'Поиск'}))
    is_online = forms.BooleanField(label="Онлайн", required=False)
    is_friend = forms.BooleanField(label="В друзьях", required=False)
