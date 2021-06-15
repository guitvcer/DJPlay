from django.views.generic import TemplateView, DetailView

from .models import Party


class PlayGomokuView(TemplateView):
    """Главная страница Гомоку"""

    template_name = 'gomoku/gomoku.html'


class WatchPartyView(DetailView):
    """Посмотреть сыгранную партию"""

    model = Party
    template_name = 'gomoku/watch_party.html'
    context_object_name = 'party'

    def get_object(self, queryset=None):
        return Party.objects.get(id=self.kwargs['id'])
