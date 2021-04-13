from django.shortcuts import render

from account.models import Game
from .models import Party


def play_gomoku(request):
    """Главная страница Гомоку"""

    context = {
        'game': Game.objects.get(name='Гомоку'),
    }

    return render(request, "gomoku/gomoku.html", context)


def watch_party(request, id):
    """Посмотреть сыгранную партию"""

    context = {
        'game': Game.objects.get(name='Гомоку'),
        'party': Party.objects.get(id=id),
    }

    return render(request, 'gomoku/watch_party.html', context)
