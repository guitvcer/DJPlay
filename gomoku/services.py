from account.models import Game, Queue
from account.services import get_user_by_token
from .models import Party, Move


def update_queue_of_gomoku(token):
    """Обновить очередь Гомоку"""

    gomoku = Game.objects.get(name="Гомоку")
    queue = Queue.objects.get(game=gomoku)

    if token is None:
        queue.player1 = None
        queue.save()
        return

    player = get_user_by_token(token)

    if queue.player1 is None:
        queue.player1 = player
        queue.save()
    elif queue.player1 == player:
        queue.player1 = None
        queue.save()
    else:
        # если очередь заполнена, создается игра и очищается очередь
        party = Party.objects.create(player1=queue.player1, player2=player)
        queue.player1 = None
        queue.save()
        return party


def player_gives_up(party_id, loser):
    """Игрок сдается"""

    party = Party.objects.get(id=party_id)

    if party.winner is not None:
        return

    if party.player1 == loser:
        party.winner = party.player2.username
    else:
        party.winner = party.player1.username

    party.save()


def create_gomoku_party():
    """Создать игру Гомоку"""

    return Party.objects.create()


def get_x(move):
    """Получить колонну/букву хода"""

    return move.coordinate[0]


def get_y(move):
    """Получить ряд/число хода"""

    if len(move.coordinate) == 2:
        return move.coordinate[1]
    else:
        return move.coordinate[1] + move.coordinate[2]


def get_letter(letter, n):
    """Получить букву через n букв после буквы"""

    return chr(ord(letter) + n)


def check_row(move, party, player):
    """Вернуть 5 точек непрерывной линии, если регистрируемый сейчас ход является завершающим линию"""

    x = get_x(move)
    y = get_y(move)

    for n in range(5):

        x_moves = []
        y_moves = []
        z_moves1 = []
        z_moves2 = []

        for i in range(5):

            # горизонталь
            try:
                move = Move.objects.get(
                    coordinate=get_letter(x, i - n) + y, party=party, player=player)
                x_moves.append(move.coordinate)
            except Move.DoesNotExist:
                pass

            # вертикаль
            try:
                move = Move.objects.get(
                    coordinate=x + str(int(y) + i - n), party=party, player=player)
                y_moves.append(move.coordinate)
            except Move.DoesNotExist:
                pass

            # диагональ 1
            try:
                move = Move.objects.get(
                    coordinate=get_letter(x, i - n) + str(int(y) + i - n), party=party, player=player)
                z_moves1.append(move.coordinate)
            except Move.DoesNotExist:
                pass

            # диагональ 2
            try:
                move = Move.objects.get(
                    coordinate=get_letter(x, n - i) + str(int(y) + i - n), party=party, player=player)
                z_moves2.append(move.coordinate)
            except Move.DoesNotExist:
                pass

        if len(x_moves) == 5:
            return x_moves
        elif len(y_moves) == 5:
            return y_moves
        elif len(z_moves1) == 5:
            return z_moves1
        elif len(z_moves2) == 5:
            return z_moves2


def register_move(coordinate, party_id, player):
    """Зарегистрировать ход, и вернуть коордианаты, в случае когда ход делает линию из 5 точек"""

    party = Party.objects.get(id=party_id)

    if coordinate == 'give_up':
        player_gives_up(party_id, player)
    else:
        move = Move.objects.create(coordinate=coordinate, player=player, party=party)
        return check_row(move, party, player)
