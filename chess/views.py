from django.shortcuts import render
from account.models import Game


def play_chess(request):
    """Главная страница Шахмат"""

    context = {
        'game': Game.objects.get(name='Шахматы'),
    }

    return render(request, 'chess/chess.html', context)
