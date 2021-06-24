from django.conf import settings
from django.http import HttpResponseForbidden
from django.views.generic import TemplateView, DetailView
from account.models import Game
from .models import Party


class PlayGomokuView(TemplateView):
    """Главная страница Гомоку"""

    template_name = 'gomoku/gomoku.html'

    def get(self, request, *args, **kwargs):
        if not Game.objects.get(name='Гомоку').is_released and not settings.DEBUG:
            return HttpResponseForbidden()

        return super().get(request, *args, **kwargs)


class WatchPartyView(DetailView):
    """Посмотреть сыгранную партию"""

    model = Party
    template_name = 'gomoku/watch_party.html'
    context_object_name = 'party'

    def get(self, request, *args, **kwargs):
        if not Game.objects.get(name='Гомоку').is_released and not settings.DEBUG:
            return HttpResponseForbidden()

        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        return Party.objects.get(id=self.kwargs['id'])
