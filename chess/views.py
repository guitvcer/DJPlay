from django.views.generic import TemplateView
from account.models import Game


class PlayChessView(TemplateView):
    """Главная страница Шахмат"""

    template_name = 'chess/chess.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['game'] = Game.objects.get(name='Шахматы')
        return context
