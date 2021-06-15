from django.views.generic import TemplateView


class PlayChessView(TemplateView):
    """Главная страница Шахмат"""

    template_name = 'chess/chess.html'
