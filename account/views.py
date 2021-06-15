import json
from django.contrib import messages
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse, reverse_lazy
from django.views.generic import TemplateView, ListView, FormView, CreateView, UpdateView, DetailView, View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from gomoku.models import Party
from . import forms
from .models import Game, MainUser
from .serializers import MainUserSerializer, MessageSerializer
from .services import (
    is_authenticated,
    get_user_by_token,
    get_active_users_by_filter,
    logout_mainuser,
    create_or_delete_or_accept_friend_request,
    has_user_access_to_view_data_of_mainuser,
    get_last_messages_with_every_user,
    search_messages,
    UsersMixin,
    get_context_for_profile_view
)


class HomeView(TemplateView):
    """Главная страница"""

    template_name = 'account/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['all_games'] = Game.objects.all()
        return context


class ProfileView(DetailView):
    """Страния профиля пользователя"""

    model = MainUser
    template_name = 'account/profile.html'

    def get(self, request, *args, **kwargs):
        if kwargs.get('username') is None and is_authenticated(request) is False:
            messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')
            return redirect('/')

        return super().get(request, *args, **kwargs)

    def get_object(self):
        username = self.kwargs.get('username')

        if username is None:
            return get_user_by_token(self.request.COOKIES['access'])

        return get_object_or_404(MainUser, username=username)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        return get_context_for_profile_view(self.object, self.request, context)


class EditProfileView(UpdateView):
    """Страница обновления данных о пользователе"""

    model = MainUser
    template_name = 'account/edit_profile.html'
    form_class = forms.MainUserUpdateForm
    success_url = reverse_lazy('account:profile')

    def get(self, request, *args, **kwargs):
        if is_authenticated(request):
            return super().get(request, *args, **kwargs)

        messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')
        return redirect('/')

    def get_object(self, queryset=None):
        return get_user_by_token(self.request.COOKIES['access'])

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, 'Ваш профиль был обновлен.')
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, form.errors)
        return super().form_invalid(form)


class RegistrationView(CreateView):
    """Страница регистрациия пользователя"""

    model = MainUser
    template_name = 'account/registration.html'
    form_class = forms.RegistrationForm
    success_url = reverse_lazy('account:authorization')

    def get(self, request, *args, **kwargs):
        if is_authenticated(request):
            messages.add_message(request, messages.WARNING, 'Вы уже авторизованы.')
            return redirect('/')

        return super().get(request, *args, **kwargs)

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, 'Вы успешно зарегистрировались.')
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, form.errors)
        return super().form_invalid(form)


class AuthorizationView(FormView):
    """Страница входа в аккаунт пользователя"""

    model = MainUser
    template_name = 'account/authorization.html'
    form_class = forms.AuthorizationOrProfileDeleteForm

    def get(self, request, *args, **kwargs):
        if is_authenticated(request):
            messages.add_message(self.request, messages.WARNING, 'Вы уже авторизованы')
            return redirect('/')

        return self.render_to_response(self.get_context_data())

    def get_success_url(self):
        return self.kwargs.get('next', '/')

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, 'Вы успешно вошли в аккаунт.')
        return form.authorize(redirect(self.get_success_url()))

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, self.get_form().errors)
        return super().form_invalid(self.get_form())


class LogoutView(View):
    """Выход из аккаунта"""

    @staticmethod
    def get(request, *args, **kwargs):
        if is_authenticated(request):
            messages.add_message(request, messages.SUCCESS, 'Вы успешно вышли из аккаунта.')

            return logout_mainuser('/')

        messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')


class DeleteProfileView(FormView):
    """Страница удаления профиля"""

    model = MainUser
    template_name = 'account/delete_profile.html'
    success_url = '/'
    form_class = forms.AuthorizationOrProfileDeleteForm

    def get(self, request, *args, **kwargs):
        if is_authenticated(request):
            return super().get(request, *args, **kwargs)

        messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')
        return redirect('/')

    def get_object(self):
        return get_user_by_token(self.request.COOKIES['access'])

    def form_valid(self, form):
        form.delete()
        messages.add_message(self.request, messages.SUCCESS, 'Вы успешно удалили свой аккаунт.')
        return logout_mainuser()

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, form.errors)
        return super().form_invalid(form)


class ChangePasswordView(FormView):
    """Сменить пароль"""

    model = MainUser
    template_name = 'account/change_password.html'
    form_class = forms.MainUserChangePasswordForm

    def get(self, request, *args, **kwargs):
        if is_authenticated(request):
            return super().get(request, *args, **kwargs)

        messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')
        return redirect('/')

    def get_form(self):
        mainuser = self.get_object()
        return self.form_class(instance=mainuser, **self.get_form_kwargs())

    def get_object(self):
        return get_user_by_token(self.request.COOKIES['access'])

    def form_valid(self, form):
        form.save()
        messages.add_message(self.request, messages.SUCCESS, 'Вы успешно сменили пароль.')
        return logout_mainuser(reverse('account:authorization'))

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, form.errors)
        return super().form_invalid(form)


class FriendRequestView(View):
    """Отправить запрос на дружбу"""

    @staticmethod
    def get(request, *args, **kwargs):
        if is_authenticated(request):
            result = create_or_delete_or_accept_friend_request(
                get_user_by_token(request.COOKIES['access']),
                kwargs['username_of_request_to'])

            messages.add_message(request, messages.SUCCESS, result)
            return redirect(reverse('account:users_profile', args=(kwargs['username_of_request_to'],)))

        messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')
        return redirect(reverse('account:users_profile', args=(kwargs['username_of_request_to'],)))


class GomokuPartiesView(ListView):
    """Страница сыгранных партии определенного пользователя"""

    model = Party
    paginate_by = 10
    context_object_name = 'parties'
    template_name = 'account/gomoku_parties.html'

    def get_mainuser(self):
        return get_object_or_404(MainUser, username=self.kwargs['username'])

    def get_queryset(self):
        return self.get_mainuser().get_gomoku_parties()

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['mainuser'] = self.get_mainuser()
        return context


class UsersView(UsersMixin, FormView, ListView):
    """Страница со всеми пользователями сайта"""

    form_class = forms.SearchMainUserForm

    def get(self, request, *args, **kwargs):
        self.mainuser = get_user_by_token(request.COOKIES['access'])

        return super(ListView, self).get(request, *args, **kwargs)

    def get_queryset(self):
        self.object_list = get_active_users_by_filter(self.request)
        return self.object_list


class UsersFriendView(FormView, ListView, UsersMixin):
    """Страница списка друзей определенного пользователя"""

    form_class = forms.SearchMainUserForm

    def get(self, request, *args, **kwargs):
        self.mainuser = get_object_or_404(MainUser, username=self.kwargs['username'])
        if not has_user_access_to_view_data_of_mainuser(self.mainuser, request):
            return HttpResponseForbidden()

        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        self.mainuser = get_object_or_404(MainUser, username=self.kwargs['username'])
        self.object_list = get_active_users_by_filter(self.request, self.mainuser.get_friends(), True)
        return self.object_list


class UsersViewsView(UsersMixin, ListView, FormView):
    """Страница списка пользователей посетивших опредленного пользователя"""

    form_class = forms.SearchMainUserForm

    def get(self, request, *args, **kwargs):
        self.mainuser = get_object_or_404(MainUser, username=self.kwargs['username'])
        if not has_user_access_to_view_data_of_mainuser(self.mainuser, request):
            return HttpResponseForbidden()

        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        self.mainuser = get_object_or_404(MainUser, username=self.kwargs['username'])
        self.object_list = get_active_users_by_filter(self.request, self.mainuser.get_views(), True)
        return self.object_list


class ChatView(ListView):
    """Страница чата"""

    model = MainUser
    template_name = 'account/chat.html'
    queryset = MainUser.objects.all()
    context_object_name = 'users'

    def get(self, request, *args, **kwargs):
        if is_authenticated(request):
            return super().get(request, *args, **kwargs)

        messages.add_message(request, messages.WARNING, 'Вы не авторизованы.')
        return redirect('/')


class ChatUserAPIView(APIView):
    """API для чата с определенным пользователем"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request, user_id):
        interlocutor = MainUser.objects.get(id=user_id)
        messages_queryset = interlocutor.get_messages(request.user)
        serializer = MessageSerializer(messages_queryset, many=True)
        data = json.dumps(serializer.data)
        data = json.loads(data)
        data.append({
            'interlocutor': interlocutor.username,
            'avatar': interlocutor.avatar.url,
            'link': interlocutor.get_absolute_url(),
        })

        return Response(data)


class ChatUsersAPIView(APIView):
    """Получить последние сообщения со всех чатов для блока с пользователями слева"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request):
        messages_queryset = get_last_messages_with_every_user(request.user)

        if not messages:
            return Response([])
        else:
            serializer = MessageSerializer(messages_queryset, many=True)
            return Response(serializer.data)


class ChatSearchAPIView(APIView):
    """API поиска сообщений"""

    permission_classes = (IsAuthenticated, )

    @staticmethod
    def get(request):
        keyword = request.GET.get('q')
        messages_queryset = search_messages(keyword, request.user.get_messages())
        serializer = MessageSerializer(messages_queryset, many=True)

        return Response(serializer.data)


class UserAPIView(APIView):
    """API возвращающий данные о пользователе по id"""

    @staticmethod
    def get(request):
        user_id = request.GET.get('id')
        user = MainUser.objects.get(id=user_id)

        if user.is_private:
            return Response([user.id, user.username, user.is_private])

        serializer = MainUserSerializer(user)

        return Response(serializer.data)
