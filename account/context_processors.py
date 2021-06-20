from django.conf import settings
from rest_framework_simplejwt.tokens import TokenError

from .models import Game
from .services import get_user_by_token, is_authenticated, get_domain


def base_context_processor(request):
    """Базовый контекстный процессор"""

    context = {
        'is_logged_in': is_authenticated(request),
        'ICONS': '/media/icons',
        'debug': settings.DEBUG,
    }

    app_name = request.path.split("/")[1]
    context['app_name'] = "account" if app_name == '' else app_name

    if app_name == 'gomoku' or app_name == 'chess':
        context['game'] = Game.objects.get(app_name=app_name)

    context['domain'] = get_domain()

    try:
        if context['is_logged_in']:
            current_user = get_user_by_token(request.COOKIES['access'])
            context['user'] = current_user
    except TokenError:
        pass

    return context
