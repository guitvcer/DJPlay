import datetime
from django.db import models
from account.models import User, Game


PIECE_Y = {
    'W': 1,
    'B': 8
}
PAWN_Y = {
    'W': 2,
    'B': 7
}


class Piece(models.Model):
    """Модель фигуры шахматной партии"""

    PIECES = [
        ('K', 'King'),
        ('Q', 'Queen'),
        ('R', 'Rook'),
        ('B', 'Bishop'),
        ('N', 'Knight'),
        ('', 'Pawn')
    ]
    COLORS = [
        ('W', 'White'),
        ('B', 'Black')
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(choices=PIECES, default='', max_length=1, verbose_name='Название фигуры')
    position = models.CharField(max_length=2, verbose_name='Текущая позиция на доске')
    party = models.ForeignKey('Party', on_delete=models.CASCADE, verbose_name="Шахматная партия")
    color = models.CharField(choices=COLORS, max_length=1, verbose_name='Цвет')

    def __str__(self):
        return self.get_name_display()

    class Meta:
        verbose_name = 'Фигура шахматной партии'
        verbose_name_plural = 'Фигуры шахматной партии'


class MoveManager(models.Manager):
    """Manager для модели хода с валидцаией хода"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.kwargs = None
        self.color = None
        self.y = None

    def validate_queue_move(self) -> None:
        """Проверка на очередь хода"""

        if self.kwargs['party'].get_moves().count() % 2 == 0 and \
                self.kwargs['player'] == self.kwargs['party'].black:

            raise Exception("White's Move, not Black's.")
        elif self.kwargs['party'].get_moves().count() % 2 == 1 and \
                self.kwargs['player'] == self.kwargs['party'].white:

            raise Exception("Black's Move, not White's.")

    def validate_rook_for_castling(self, coordinate: str) -> None:
        """Проверка существования и "не ходьбы" ладьи для рокировки"""

        try:
            Move.objects.get(piece='R', moved_from=coordinate, party=self.kwargs['party'])
            raise Exception('Rook must not move before castling.')
        except Move.DoesNotExist:
            try:
                Move.objects.get(moved_to=coordinate, party=self.kwargs['party'])
                raise Exception('No Rook.')
            except Move.DoesNotExist:
                pass

    def validate_pieces_for_existing(self, *coordinates: str) -> None:
        """Проверка на существования фигур по координатам"""

        try:
            for coordinate in coordinates:
                Piece.objects.get(party=self.kwargs['party'], position=coordinate)
        except Move.DoesNotExist:
            raise Exception('There must be no pieces between the King and the Rook')

    def validate_castling(self) -> None:
        """Валидация рокировки"""

        try:
            # проверка "не ходьбы" короля
            Move.objects.get(piece='K', party=self.kwargs['party'])
            raise Exception('King must not move before castling.')
        except Move.DoesNotExist:
            if self.kwargs['castling'] == 'S':
                self.validate_rook_for_castling(f'h{self.y}')
                self.validate_pieces_for_existing(f'f{self.y}', f'g{self.y}')
            elif self.kwargs['castling'] == 'S':
                self.validate_rook_for_castling(f'a{self.y}')
                self.validate_pieces_for_existing(f'b{self.y}', f'c{self.y}', f'd{self.y}')

    @staticmethod
    def validate_x(coordinate: str) -> None:
        if ord(coordinate[0]) < 97 or ord(coordinate[0]) > 122:
            raise Exception('Wrong coordinates.')

    @staticmethod
    def validate_y(coordinate: str) -> None:
        try:
            if int(coordinate[1]) < 1 or int(coordinate[1]) > 8:
                raise Exception('Wrong coordinates.')
        except ValueError:
            raise Exception('Wrong coordinates.')

    def validate_coordinates(self, moved_from: str, moved_to: str) -> None:
        self.validate_x(moved_from)
        self.validate_y(moved_from)

        self.validate_x(moved_to)
        self.validate_y(moved_to)

    def validate_moved_to_for_friendly_piece(self, moved_to: str) -> None:
        try:
            self.kwargs['party'].get_pieces().get(position=moved_to, color=self.color)
            raise Exception('Impossible to eat friendly piece.')
        except Piece.DoesNotExist:
            pass

    def create(self, **kwargs):
        try:
            self.kwargs = kwargs
            self.color = 'W' if self.player == self.party.white else 'B'
            self.y = PIECE_Y[self.color]

            self.validate_queue_move()

            # TODO: проверка на шах

            if kwargs.get('castling'):
                self.validate_castling()
            else:
                self.validate_coordinates(self.kwargs['moved_from'], self.kwargs['moved_to'])
                self.validate_moved_to_for_friendly_piece(self.kwargs['moved_to'])

                # TODO: проверка на правильные координаты moved_to для определенной фигуры

            return super().create(**kwargs)
        except KeyError:
            return super().create(**kwargs)


class Move(models.Model):
    """Модель хода шахматной партии"""

    CASTLING = [
        ('S', 'O-O'),
        ('L', 'O-O-O')
    ]

    id = models.AutoField(primary_key=True)
    party = models.ForeignKey('Party', on_delete=models.CASCADE, verbose_name="Партия")
    player = models.ForeignKey(User, on_delete=models.CASCADE,
                               verbose_name="Игрок", related_name="chess_move_player")
    castling = models.CharField(null=True, blank=True, max_length=1, choices=CASTLING)
    piece = models.ForeignKey(Piece, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Фигура")
    moved_from = models.CharField(null=True, blank=True, max_length=2, verbose_name="Откуда?")
    moved_to = models.CharField(null=True, blank=True, max_length=2, verbose_name="Куда?")
    eaten_piece = models.ForeignKey(Piece, on_delete=models.CASCADE, null=True, blank=True,
                                    verbose_name="Съеденная фигура", related_name="chess_eaten_piece")
    time = models.TimeField(verbose_name="Потраченное время на ход")

    objects = MoveManager()

    def __str__(self):
        if self.castling:
            return f'{self.party}, {self.player}: {self.get_castling_display()}'

        if self.eaten_piece:
            return f'{self.party}, {self.player}: {self.piece}{self.moved_from}x{self.moved_to}'
        else:
            return f'{self.party}, {self.player}: {self.piece}{self.moved_from}-{self.moved_to}'

    class Meta:
        verbose_name = 'Ход шахматной партии'
        verbose_name_plural = 'Ходы шахматной партии'
        ordering = ('id',)


class PartyManager(models.Manager):
    """Manager модели Шахматной партии"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.party = None

    @staticmethod
    def create_pawns(color: str, party) -> None:
        for pawn_serial_number in range(8):
            Piece.objects.create(
                party=party,
                color=color,
                position=f'{chr(97 + pawn_serial_number)}{PAWN_Y[color]}'
            )

    @staticmethod
    def create_rooks(color: str, party) -> None:
        for rook_x in range(0, 8, 7):
            Piece.objects.create(
                party=party,
                name='R',
                color=color[0],
                position=f'{chr(97 + rook_x)}{PIECE_Y[color[0]]}'
            )

    @staticmethod
    def create_knights(color: str, party) -> None:
        for knight_x in range(1, 7, 5):
            Piece.objects.create(
                party=party,
                name='N',
                color=color,
                position=f'{chr(97 + knight_x)}{PIECE_Y[color]}'
            )

    @staticmethod
    def create_bishops(color: str, party) -> None:
        for bishop_x in range(2, 6, 3):
            Piece.objects.create(
                party=party,
                name='B',
                color=color,
                position=f'{chr(97 + bishop_x)}{PIECE_Y[color]}'
            )

    def create_initial_pieces(self, party) -> None:
        for color in Piece.COLORS:
            self.create_pawns(color[0], party)
            self.create_rooks(color[0], party)
            self.create_knights(color[0], party)
            self.create_bishops(color[0], party)

            Piece.objects.create(
                party=party,
                name='Q',
                color=color[0],
                position=f'{chr(97 + 3)}{PIECE_Y[color[0]]}'
            )
            Piece.objects.create(
                party=party,
                name='K',
                color=color[0],
                position=f'{chr(97 + 4)}{PIECE_Y[color[0]]}'
            )

    def create(self, **kwargs):
        chess = Game.objects.get(app_name='chess')
        party = super().create(game=chess, **kwargs)
        self.create_initial_pieces(party)

        return self.party


class Party(models.Model):
    """Модель шахматной партии"""

    id = models.AutoField(primary_key=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Игра", related_name="chess_game")
    white = models.ForeignKey(User, on_delete=models.PROTECT,
                              verbose_name="Белый игрок", related_name="chess_white_player")
    black = models.ForeignKey(User, on_delete=models.PROTECT,
                              verbose_name="Черный игрок", related_name="chess_black_player")
    winner = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Победитель")
    time = models.TimeField(default=datetime.time(minute=10), verbose_name="Время на ход")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата")

    objects = PartyManager()

    def __str__(self):
        return f'№{self.id} партия'

    def get_pieces(self):
        return Piece.objects.filter(party=self)

    def get_moves(self):
        return Move.objects.filter(party=self)

    class Meta:
        verbose_name = 'Шахматная партия'
        verbose_name_plural = 'Шахматные партии'
