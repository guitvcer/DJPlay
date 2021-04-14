from account.models import MainUser
from django.db import models


class Move(models.Model):
    """Модель конкретного хода конкретной партии Гомоку"""

    coordinate = models.CharField(max_length=3, verbose_name="Координата хода")
    player = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Игрок")
    party = models.ForeignKey('Party', on_delete=models.CASCADE, verbose_name="Партия")

    def __str__(self):
        return self.party.__str__()

    class Meta:
        verbose_name = 'Ход партии Гомоку'
        verbose_name_plural = 'Ходы партии Гомоку'


class Party(models.Model):
    """Модель партии Гомоку"""

    player1 = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Игрок 1", related_name="+")
    player2 = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Игрок 2", related_name="+")
    winner = models.CharField(max_length=64, null=True, verbose_name="Победивший игрок")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата начала")

    def __str__(self):
        return f'id={self.id}, {self.player1}, {self.player2}, {self.date.date()}'

    def get_messages(self):
        return Message.objecs.filter(party=self)

    def get_moves(self):
        """Получить ходы партии"""

        return Move.objects.filter(party=self)

    class Meta:
        verbose_name = 'Партия Гомоку'
        verbose_name_plural = 'Партии Гомоку'


class Message(models.Model):
    """Модель сообщения чата Гомоку"""

    party = models.ForeignKey(Party, on_delete=models.CASCADE, verbose_name="Партия")
    text = models.TextField(verbose_name="Сообщение")
    player = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Отправитель")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время")

    def __str__(self):
        return f'{self.party} партия'

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
