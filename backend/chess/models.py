import datetime
from django.db import models
from account.models import User


class Move(models.Model):
    """Модель определенного хода партии Шахмат"""

    PIECES = [
        ('K', 'King'),
        ('Q', 'Queen'),
        ('R', 'Rook'),
        ('B', 'Bishop'),
        ('N', 'Knight'),
        ('', ''),  # Pawn
    ]
    CASTLING = [
        ('S', 'O-O'),
        ('L', 'O-O-O'),
    ]

    party = models.ForeignKey('Party', on_delete=models.CASCADE, verbose_name="Партия")
    player = models.ForeignKey(User, on_delete=models.CASCADE,
                               verbose_name="Игрок", related_name="chess_move_player")
    castling = models.CharField(null=True, blank=True, max_length=1, choices=CASTLING)
    piece = models.CharField(null=True, blank=True, max_length=1, choices=PIECES, verbose_name="Фигура")
    moved_from = models.CharField(null=True, blank=True, max_length=2, verbose_name="Откуда")
    moved_to = models.CharField(null=True, blank=True, max_length=2, verbose_name="Куда")
    ate = models.BooleanField(default=False, verbose_name="Съел фигуру?")
    time = models.TimeField(null=True, blank=True, verbose_name="Время на ход")

    def __str__(self):
        if self.castling:
            return self.get_castling_display()

        if self.ate:
            return f'{self.piece}{self.moved_from}x{self.moved_to}'
        else:
            return f'{self.piece}{self.moved_from}-{self.moved_to}'

    class Meta:
        verbose_name = 'Ход партии Шахмат'
        verbose_name_plural = 'Ходы партии Шахмат'
        ordering = ('id', )


class Party(models.Model):
    """Модель партии Шахмат"""

    white = models.ForeignKey(User, on_delete=models.PROTECT,
                              verbose_name="Белый", related_name="chess_white_player")
    black = models.ForeignKey(User, on_delete=models.PROTECT,
                              verbose_name="Черный", related_name="chess_black_player")
    time = models.TimeField(default=datetime.time(minute=10), verbose_name="Время")
    result = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Результат")

    def __str__(self): return f'{self.id} партия'

    def get_moves(self):
        return Move.objects.filter(party=self)

    class Meta:
        verbose_name = 'Партия Шахмат'
        verbose_name_plural = 'Партии Шахмат'
