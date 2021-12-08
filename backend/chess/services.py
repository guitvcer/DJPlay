from rest_framework.generics import get_object_or_404

from account.models import Game
from .models import Queue, Party


def add_chess_into_database() -> None:
    """Добавить Шахматы в БД, если нету"""

    chess, created = Game.objects.get_or_create(
        name="Шахматы",
        app_name="chess",
        rules="Шахматная партия ведётся между двумя соперниками на шахматной доске путём передвижения"
              " шахматных фигур. Соперником в шахматной партии может быть один человек, коллектив из"
              " нескольких человек или компьютер.<ul><li>Партия считается выигранной шахматистом,"
              " который дал мат королю соперника.</li><li>Партия считается выигранной тем из партнёров,"
              " противник которого признал себя побеждённым.</li><li>Партия считается выигранной, если у"
              " одного из шахматистов закончилось время на ходы.</li></ul>",
        image="/chess/chess-logo.png",
        is_released=False,
    )
    Queue.objects.get_or_create(game=chess)


def draw_party(party_id: int) -> None:
    """Сделать партию ничейной"""

    party = get_object_or_404(Party.objects.all(), id=party_id)
    party.result = 'D'
    party.save()
