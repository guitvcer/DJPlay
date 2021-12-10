from account.models import User, Game
from django.db import models


class Move(models.Model):
    """Модель конкретного хода конкретной партии Гомоку"""

    id = models.AutoField(primary_key=True)
    coordinate = models.CharField(max_length=3, verbose_name="Координата хода")
    player = models.ForeignKey(User, on_delete=models.PROTECT,
                               verbose_name="Игрок", related_name="gomoku_move_player")
    party = models.ForeignKey("Party", on_delete=models.CASCADE, verbose_name="Партия")

    def __str__(self): return f"{self.coordinate, self.player, self.party.id}"

    class Meta:
        verbose_name = "Ход партии Гомоку"
        verbose_name_plural = "Ходы партии Гомоку"
        ordering = ("id", )


class Party(models.Model):
    """Модель партии Гомоку"""

    id = models.AutoField(primary_key=True)
    player_1 = models.ForeignKey(User, on_delete=models.PROTECT,
                                 verbose_name="Игрок 1", related_name="gomoku_first_player")
    player_2 = models.ForeignKey(User, on_delete=models.PROTECT,
                                 verbose_name="Игрок 2", related_name="gomoku_second_player")
    winner = models.CharField(max_length=64, null=True, verbose_name="Победитель")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата")

    def __str__(self): return f"id={self.id}, {self.player_1}, {self.player_2}, {self.date.date()}"

    def get_moves(self) -> models.QuerySet:
        """Получить ходы партии"""

        return Move.objects.filter(party=self)

    class Meta:
        verbose_name = "Партия Гомоку"
        verbose_name_plural = "Партии Гомоку"


class Queue(models.Model):
    """Модель очереди для Гомоку"""

    id = models.AutoField(primary_key=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Очередь для",
                             related_name="gomoku_queue")
    player_1 = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True, verbose_name="Игрок 1",
                                 related_name="gomoku_queue_player")

    def __str__(self): return f"Очередь для {self.game.name}"

    def update_queue(self, player: User = None, clear: bool = False):
        if clear:
            self.player_1 = None
            self.save()
            return

        if player is not None:
            if self.player_1 is None:
                self.player_1 = player
                self.save()
            elif self.player_1 == player:
                pass
            else:
                # если очередь заполнена, создается игра и очищается очередь

                party = Party.objects.create(player_1=self.player_1, player_2=player)
                self.player_1 = None
                self.save()

                return party

    class Meta:
        verbose_name = "Очередь для Гомоку"
        verbose_name_plural = "Очереди для Гомоку"
