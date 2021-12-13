import datetime
from rest_framework.generics import get_object_or_404

from account.models import Game, User
from .models import Queue, Party, Move


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


def player_gives_up(party_id: int, player: User):
    """Указанный игрок проигрывает"""

    party = get_object_or_404(Party.objects.all(), id=party_id)
    party.result = 'W' if party.black == player else 'B'
    party.save()


def make_move(party_id: int, notation: str, seconds: int, player: User) -> None:
    """Сделать ход"""

    party = get_object_or_404(Party.objects.all(), id=party_id)
    time = parse_time(seconds)
    Move.objects.create(party=party, notation=notation, player=player, time=time)


def parse_time(total_seconds: int) -> datetime.time:
    """Перевести секунды для models.TimeField()"""

    hours = 0
    minutes = 0
    seconds = total_seconds

    if total_seconds > 59:
        seconds = total_seconds % 60
        minutes = total_minutes = int((total_seconds - seconds) / 60)

        if total_minutes > 59:
            minutes = total_minutes % 60
            hours = int((total_minutes - minutes) / 60)

    return datetime.time(hours, minutes, seconds)


def checkmate(party_id: int, loser: User):
    """Указать соперника проигравшего как победителя"""

    party = get_object_or_404(Party.objects.all(), id=party_id)
    party.result = 'W' if party.black == loser else 'B'
    party.save()


def cancel_move(party_id: int, notation: str) -> bool:
    """Отменить последний ход"""

    party = get_object_or_404(Party.objects.all(), id=party_id)

    if str(party.move_set.last()) == notation:
        Move.objects.filter(party=party).last().delete()
        return True
    else:
        return False
