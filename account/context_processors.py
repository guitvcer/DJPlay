from rest_framework_simplejwt.tokens import TokenError

from .services import get_user_by_token, is_authenticated


def base_context_processor(request):
    """Базовый контекстный процессор"""

    context = {
        'is_logged_in': is_authenticated(request),
        'ICONS': '/media/icons',
    }

    try:
        if context['is_logged_in']:
            current_user = get_user_by_token(request.COOKIES['access'])
            context['user'] = current_user
    except TokenError:
        pass

    return context
