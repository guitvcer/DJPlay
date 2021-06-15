from django.views.generic import TemplateView

from account.models import Game
from .models import Party


class PlayGomokuView(TemplateView):
    """Главная страница Гомоку"""

    template_name = 'gomoku/gomoku.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['game'] = Game.objects.get(name='Гомоку')
        return context


class WatchPartyView(TemplateView):
    """Посмотреть сыгранную партию"""

    template_name = 'gomoku/watch_party.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['game'] = Game.objects.get(name='Гомоку')
        context['party'] = Party.objects.get(id=kwargs['id'])
        return context
