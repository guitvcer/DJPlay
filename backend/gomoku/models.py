from account.models import User
from django.db import models


class Move(models.Model):
    """Модель конкретного хода конкретной партии Гомоку"""

    id = models.AutoField(primary_key=True)
    coordinate = models.CharField(max_length=3, verbose_name="Координата хода")
    player = models.ForeignKey(User, on_delete=models.PROTECT,
                               verbose_name="Игрок", related_name="gomoku_move_player")
    party = models.ForeignKey('Party', on_delete=models.CASCADE, verbose_name="Партия")

    def __str__(self):
        return self.party.__str__()

    class Meta:
        verbose_name = 'Ход партии Гомоку'
        verbose_name_plural = 'Ходы партии Гомоку'
        ordering = ('id', )


class Party(models.Model):
    """Модель партии Гомоку"""

    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey(User, on_delete=models.PROTECT,
                                verbose_name="Игрок 1", related_name="gomokus_first_player")
    player2 = models.ForeignKey(User, on_delete=models.PROTECT,
                                verbose_name="Игрок 2", related_name="gomokus_second_player")
    winner = models.CharField(max_length=64, null=True, verbose_name="Победивший игрок")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата начала")

    def __str__(self):
        return f'id={self.id}, {self.player1}, {self.player2}, {self.date.date()}'

    def get_messages(self):
        return Message.objects.filter(party=self)

    def get_moves(self):
        """Получить ходы партии"""

        return Move.objects.filter(party=self)

    class Meta:
        verbose_name = 'Партия Гомоку'
        verbose_name_plural = 'Партии Гомоку'


class Message(models.Model):
    """Модель сообщения чата Гомоку"""

    id = models.AutoField(primary_key=True)
    party = models.ForeignKey(Party, on_delete=models.CASCADE, verbose_name="Партия")
    text = models.TextField(verbose_name="Сообщение")
    player = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Отправитель")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время")

    def __str__(self):
        return f'{self.party} партия'

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
