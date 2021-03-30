from django.shortcuts import render

from account.models import Game
from .models import Party
from .services import get_letters_from_a_to_o


def play_gomoku(request):
    """Главная страница Гомоку"""

    context = {
        'count': range(15, 0, -1),
        'count14': range(14),
        'game': Game.objects.get(name='Гомоку'),
        'letters': get_letters_from_a_to_o(),
    }

    return render(request, "gomoku/gomoku.html", context)


def watch_party(request, id):
    """Посмотреть сыгранную партию"""

    context = {
        'count': range(15, 0, -1),
        'count14': range(14),
        'game': Game.objects.get(name='Гомоку'),
        'letters': get_letters_from_a_to_o(),
        'party': Party.objects.get(id=id),
    }

    return render(request, 'gomoku/watch_party.html', context)
