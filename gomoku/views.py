from django.shortcuts import render

from account.models import Game
from .models import Party
from .services import get_letters_from_a_to_o


context_for_field = {
    'count': range(15, 0, -1),
    'count14': range(14),
    'game': Game.objects.get(name='Гомоку'),
    'letters': get_letters_from_a_to_o(),
}


def play_gomoku(request):
    """Главная страница Гомоку"""

    return render(request, "gomoku/gomoku.html", context_for_field)


def watch_party(request, id):
    """Посмотреть сыгранную партию"""

    context = context_for_field
    context['party'] = Party.objects.get(id=id)

    return render(request, 'gomoku/watch_party.html', context)
