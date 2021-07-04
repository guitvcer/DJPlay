from django.conf import settings
from django.http import HttpResponseForbidden
from django.views.generic import TemplateView
from account.models import Game


class PlayChessView(TemplateView):
    """Главная страница Шахмат"""

    template_name = 'chess/chess.html'

    def get(self, request, *args, **kwargs):
        if not Game.objects.get(name='Шахматы').is_released and not settings.DEBUG:
            return HttpResponseForbidden()

        return super().get(request, *args, **kwargs)
