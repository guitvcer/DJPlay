from account.models import User, Game
from .exceptions import NotValidCoordinate
from .models import Party, Move, Queue


def player_gives_up(party_id: id, loser: User) -> None:
    """Игрок сдается"""

    party = Party.objects.get(id=party_id)

    if party.winner is not None:
        return

    if party.player_1 == loser:
        party.winner = party.player_2.username
    else:
        party.winner = party.player_1.username

    party.save()


def get_x(move: Move) -> str:
    """Получить колонну/букву хода"""

    return move.coordinate[0]


def get_y(move: Move) -> int:
    """Получить ряд/число хода"""

    if len(move.coordinate) == 2:
        return int(move.coordinate[1])
    else:
        return int(move.coordinate[1] + move.coordinate[2])


def get_letter(letter: str, n: int) -> str:
    """Получить букву через n букв после буквы"""

    return chr(ord(letter) + n)


def check_row(move: Move, party: Party, player: User) -> (list, None):
    """Вернуть 5 точек непрерывной линии, если регистрируемый сейчас ход является завершающим линию"""

    x = get_x(move)
    y = get_y(move)

    for n in range(5):

        x_moves = []
        y_moves = []
        z_moves_1 = []
        z_moves_2 = []

        for i in range(5):
            # горизонталь
            try:
                move = Move.objects.get(party=party, player=player, coordinate=f'{get_letter(x, n - i)}{y}')
                x_moves.append(move.coordinate)
            except Move.DoesNotExist:
                x_moves = []

            # вертикаль
            try:
                move = Move.objects.get(party=party, player=player, coordinate=f'{x}{y - n + i}')
                y_moves.append(move.coordinate)
            except Move.DoesNotExist:
                y_moves = []

            # диагональ 1
            try:
                move = Move.objects.get(party=party, player=player,
                                        coordinate=f'{get_letter(x, n - i)}{y + i - n}')
                z_moves_1.append(move.coordinate)
            except Move.DoesNotExist:
                z_moves_1 = []

            # диагональ 2
            try:
                move = Move.objects.get(party=party, player=player,
                                        coordinate=f'{get_letter(x, n - i)}{y - i + n}')
                z_moves_2.append(move.coordinate)
            except Move.DoesNotExist:
                z_moves_2 = []

        if len(x_moves) == 5:
            return x_moves
        elif len(y_moves) == 5:
            return y_moves
        elif len(z_moves_1) == 5:
            return z_moves_1
        elif len(z_moves_2) == 5:
            return z_moves_2


def validate_coordinate(coordinate: str) -> None:
    """Валидировать координату"""

    try:
        if ord(coordinate[0]) not in range(97, 112):
            raise NotValidCoordinate

        try:
            y = int(coordinate[1]) * 10 + int(coordinate[2])
        except IndexError:
            y = int(coordinate[1])

        if y not in range(1, 16):
            raise NotValidCoordinate
    except IndexError:
        raise NotValidCoordinate


def register_move(coordinate: str, party_id: int, player: User) -> (list, None):
    """Зарегистрировать ход, и вернуть коордианаты, в случае когда ход делает линию из 5 точек"""

    validate_coordinate(coordinate)

    party = Party.objects.get(id=party_id)

    try:
        move = Move.objects.get(coordinate=coordinate, player=player, party=party)
    except Move.DoesNotExist:
        move = Move.objects.create(coordinate=coordinate, player=player, party=party)

    return check_row(move, party, player)


def cancel_move(party_id: int, coordinate: str) -> None:
    """Отменить ход"""

    party = Party.objects.get(id=party_id)
    move = Move.objects.get(coordinate=coordinate, party=party)
    move.delete()


def add_gomoku_into_database() -> None:
    """Добавить Гомоку в БД, если нету"""

    gomoku = None

    try:
        gomoku = Game.objects.get(name="Гомоку")
        Queue.objects.get(game=gomoku)
    except Game.DoesNotExist:
        gomoku = Game.objects.create(
            name="Гомоку",
            app_name="gomoku",
            rules="Гомоку — настольная логическая игра для двух игроков."
                  " На квадратной доске размером 15×15 пунктов игроки поочерёдно выставляют камни двух цветов."
                  " Выигрывает тот, кто первым построит непрерывный ряд из пяти камней своего цвета по"
                  " вертикали, горизонтали или диагонали.",
            image="/gomoku/gomoku.png",
            is_released=True
        )
        Queue.objects.create(game=gomoku)
    except Queue.DoesNotExist:
        Queue.objects.create(game=gomoku)
