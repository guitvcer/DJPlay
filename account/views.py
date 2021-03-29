from django.contrib import messages
from django.core.paginator import Paginator
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse

from . import forms
from .models import Game, MainUser, FriendRequest, MainUserView
from .services import (
    create_mainuser,
    is_authenticated,
    get_user_by_token,
    update_mainuser,
    authorize_user,
    get_active_users_by_filter,
    logout_mainuser,
    delete_mainuser,
    change_password_of_user,
    create_or_delete_or_accept_friend_request,
    has_user_access_to_view_data_of_mainuser
)


def home(request):
    """Главная страница"""

    return render(request, 'account/home.html', {'all_games': Game.objects.all()})


def profile(request, username=None):
    """Страница профиля пользователя"""

    context = {}

    if username is not None:
        mainuser = get_object_or_404(MainUser, username=username)

        context['mainuser'] = mainuser

        if is_authenticated(request):

            user = get_user_by_token(request.COOKIES['access'])

            if mainuser != user:
                try:
                    MainUserView.objects.get(view_from=user, view_to=mainuser)
                except MainUserView.DoesNotExist:
                    MainUserView.objects.create(view_from=user, view_to=mainuser)

            try:
                context['friend_request'] = FriendRequest.objects.get(
                    request_from=get_user_by_token(request.COOKIES['access']),
                    request_to=context['mainuser'])
            except FriendRequest.DoesNotExist:
                try:
                    context['friend_request'] = FriendRequest.objects.get(
                        request_from=context['mainuser'],
                        request_to=get_user_by_token(request.COOKIES['access'])
                    )
                except FriendRequest.DoesNotExist:
                    pass
            except KeyError:
                context['friend_request'] = None

    elif is_authenticated(request):
        context['mainuser'] = get_user_by_token(request.COOKIES['access'])
    else:
        return redirect('/')

    return render(request, 'account/profile.html', context)


def edit_profile(request):
    """Страница обновления данных о пользователе"""

    if is_authenticated(request):
        token = request.COOKIES['access']
        user = get_user_by_token(token)
        form = forms.MainUserUpdateForm(instance=user)

        if request.method == 'POST':
            form = forms.MainUserUpdateForm(request.POST)
            result = update_mainuser(request.POST, get_user_by_token(token))

            if result is not True:
                messages.add_message(request, messages.ERROR, result)
            else:
                messages.add_message(request, messages.SUCCESS, "Ваш профиль был обновлен")
                return redirect(reverse('account:profile'))

        return render(request, 'account/edit_profile.html', {'form': form})

    return redirect('/')


def registration(request):
    """Страница регистрации пользователя"""

    if is_authenticated(request):
        return redirect('/')

    form = forms.RegistrationForm()

    if request.method == "POST":
        form = forms.RegistrationForm(request.POST)
        result = create_mainuser(request.POST)

        if result is not True:
            messages.add_message(request, messages.ERROR, result)
        else:
            return redirect(reverse('account:authorization'))

    return render(request, 'account/registration.html', {'form': form})


def authorization(request):
    """Страница входа в аккаунт пользователя"""

    if is_authenticated(request):
        return redirect('/')

    form = forms.AuthorizationForm()

    if request.method == 'POST':
        data = authorize_user(request.POST['username'], request.POST['password'])

        if type(data) == str:
            messages.add_message(request, messages.ERROR, data)
        else:
            response = redirect('/')
            response.set_cookie('access', data['access'])
            response.set_cookie('refresh', data['refresh'])
            return response

    return render(request, 'account/authorization.html', {'form': form})


def logout(request):
    """Выход из аккаунта"""

    if is_authenticated(request):
        response = redirect('/')
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response

    return redirect('/')


def users(request):
    """Страница со всеми пользователями сайта"""

    active_users = get_active_users_by_filter(request)
    context = {
        'active_users': active_users,
        'form': forms.SearchMainUserForm(),
        'title': 'Пользователи DJPlay',
    }
    if request.method == 'POST':
        context['form'] = forms.SearchMainUserForm(request.POST)

    return render(request, 'account/users.html', context)


def delete_profile(request):
    """Страница удаления профиля"""

    if is_authenticated(request):
        form = forms.MainUserDeleteForm()

        if request.method == 'POST':
            form = forms.MainUserDeleteForm(request.POST)
            result = delete_mainuser(get_user_by_token(request.COOKIES['access']),
                                     request.POST['password'])

            if type(result) == str:
                messages.add_message(request, messages.ERROR, result)
            else:
                return logout_mainuser()

        return render(request, 'account/delete_profile.html', {'form': form})

    return redirect(reverse('account:authorization'))


def change_password(request):
    """Сменить пароль"""

    form = forms.MainUserChangePasswordForm()
    if request.method == 'POST':
        form = forms.MainUserChangePasswordForm(request.POST)
        result = change_password_of_user(get_user_by_token(request.COOKIES['access']), request.POST)

        if type(result) == str:
            messages.add_message(request, messages.ERROR, result)
        else:
            return logout_mainuser()

    return render(request, 'account/change_password.html', {'form': form})


def friend_request(request, username_of_request_to):
    """Отправить запрос на дружбу"""

    if is_authenticated(request):
        result = create_or_delete_or_accept_friend_request(
            get_user_by_token(request.COOKIES['access']),
            username_of_request_to)

        messages.add_message(request, messages.SUCCESS, result)
        return redirect(reverse('account:users_profile', args=(username_of_request_to,)))

    return redirect(reverse('account:authorization'))


def gomoku_parties(request, username):
    """Страница сыгранных партии конкретного пользователя"""

    mainuser = MainUser.objects.get(username=username)
    mainusers_all_parties = mainuser.get_gomoku_parties()

    paginator = Paginator(mainusers_all_parties, 10)
    if 'page' in request.GET:
        page_num = request.GET['page']
    else:
        page_num = 1
    page = paginator.get_page(page_num)

    return render(request, 'account/gomoku_parties.html', {
        'mainuser': mainuser,
        'parties': page.object_list,
        'page': page,
    })


def users_friends(request, username):
    """Страница списка друзей определенного пользователя"""

    mainuser = get_object_or_404(MainUser, username=username)

    if not has_user_access_to_view_data_of_mainuser(mainuser, request):
        return HttpResponseForbidden()

    context = {
        'active_users': mainuser.get_friends(),
        'form': forms.SearchMainUserForm(),
        'title': f'Друзья {mainuser}',
    }

    if request.method == 'POST':
        context['form'] = forms.SearchMainUserForm(request.POST)

    return render(request, 'account/users.html', context)


def users_views(request, username):
    """Страница списка пользователей посетивших опредленного пользователя"""

    mainuser = get_object_or_404(MainUser, username=username)

    if not has_user_access_to_view_data_of_mainuser(mainuser, request):
        return HttpResponseForbidden()

    context = {
        'active_users': mainuser.get_views(),
        'form': forms.SearchMainUserForm(),
        'title': f'Пользователи посетившие {mainuser}'
    }

    if request.method == 'POST':
        context['form'] = forms.SearchMainUserForm(request.POST)

    return render(request, 'account/users.html', context)
