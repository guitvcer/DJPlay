from account.models import User
from .models import Party, Move


def player_gives_up(party_id: id, loser: User) -> None:
    """Игрок сдается"""

    party = Party.objects.get(id=party_id)

    if party.winner is not None:
        return

    if party.player1 == loser:
        party.winner = party.player2.username
    else:
        party.winner = party.player1.username

    party.save()


def get_x(move: Move) -> str:
    """Получить колонну/букву хода"""

    return move.coordinate[0]


def get_y(move: Move) -> str:
    """Получить ряд/число хода"""

    if len(move.coordinate) == 2:
        return move.coordinate[1]
    else:
        return move.coordinate[1] + move.coordinate[2]


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
                pass

            # вертикаль
            try:
                move = Move.objects.get(party=party, player=player, coordinate=f'{x}{int(y) - n + i}')
                y_moves.append(move.coordinate)
            except Move.DoesNotExist:
                pass

            # диагональ 1
            try:
                move = Move.objects.get(party=party, player=player, coordinate=f'{get_letter(x, n - i)}{int(y) + i - n}')
                z_moves_1.append(move.coordinate)
            except Move.DoesNotExist:
                pass

            # диагональ 2
            try:
                move = Move.objects.get(party=party, player=player, coordinate=f'{get_letter(x, n - i)}{int(y) - i + n}')
                z_moves_2.append(move.coordinate)
            except Move.DoesNotExist:
                pass

        if len(x_moves) == 5:
            return x_moves
        elif len(y_moves) == 5:
            return y_moves
        elif len(z_moves_1) == 5:
            return z_moves_1
        elif len(z_moves_2) == 5:
            return z_moves_2


def register_move(coordinate: str, party_id: int, player: User) -> (list, None):
    """Зарегистрировать ход, и вернуть коордианаты, в случае когда ход делает линию из 5 точек"""

    if coordinate == 'nothing':
        return

    party = Party.objects.get(id=party_id)

    if coordinate == 'give_up':
        player_gives_up(party_id, player)
    else:
        try:
            move = Move.objects.get(coordinate=coordinate, player=player, party=party)
        except Move.DoesNotExist:
            move = Move.objects.create(coordinate=coordinate, player=player, party=party)
        return check_row(move, party, player)


def delete_returnable_move(party_id: int, coordinate: str) -> None:
    """Удалить ходы после возвращаемого хода"""

    party = Party.objects.get(id=party_id)
    move = Move.objects.get(coordinate=coordinate, party=party)
    move.delete()
