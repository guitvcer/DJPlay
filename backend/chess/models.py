import datetime
from django.db import models
from random import getrandbits
from account.models import User, Game


class Move(models.Model):
    """Модель хода шахматной партии"""

    id = models.AutoField(primary_key=True)
    party = models.ForeignKey("Party", on_delete=models.CASCADE, verbose_name="Партия")
    player = models.ForeignKey(User, on_delete=models.CASCADE,
                               verbose_name="Игрок", related_name="chess_move_player")
    notation = models.CharField(max_length=5, verbose_name="Ход в шахматной нотации")
    time = models.TimeField(verbose_name="Потраченное время на ход")

    def __str__(self): return self.notation

    class Meta:
        verbose_name = "Ход шахматной партии"
        verbose_name_plural = "Ходы шахматной партии"
        ordering = ("id", )


class Party(models.Model):
    """Модель шахматной партии"""

    RESULT_CHOICES = (
        ('W', "White"),
        ('B', "Black"),
        ('D', "Draw"),
    )

    id = models.AutoField(primary_key=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Игра", related_name="chess_game")
    white = models.ForeignKey(User, on_delete=models.PROTECT,
                              verbose_name="Белый игрок", related_name="chess_white_player")
    black = models.ForeignKey(User, on_delete=models.PROTECT,
                              verbose_name="Черный игрок", related_name="chess_black_player")
    result = models.CharField(max_length=1, choices=RESULT_CHOICES, verbose_name="Результат")
    time = models.TimeField(default=datetime.time(minute=10), verbose_name="Время на ход")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата")

    def __str__(self):
        return f"№{self.id} партия"

    class Meta:
        verbose_name = "Шахматная партия"
        verbose_name_plural = "Шахматные партии"


class Queue(models.Model):
    """Модели очереди Шахмат"""

    id = models.AutoField(primary_key=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Очередь для",
                             related_name="chess_queue")
    player = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                               verbose_name="Игрок", related_name="chess_queue_player")

    def __str__(self): return f"очередь для {self.game.name}"

    def update_queue(self, player: User = None, clear: bool = False):
        if clear:
            self.player = None
            self.save()
            return

        if player is not None:
            if self.player is None:
                self.player = player
                self.save()
            elif self.player == player:
                pass
            else:
                # если очередь заполнена, создается игра и очищается очередь

                if bool(getrandbits(1)):
                    white = player
                    black = self.player
                else:
                    white = self.player
                    black = player

                self.player = None
                self.save()

                party = Party.objects.create(white=white, black=black, game=self.game)

                return party

    class Meta:
        verbose_name = "Очередь для Шахматов"
        verbose_name_plural = "Очереди для Шахматов"
