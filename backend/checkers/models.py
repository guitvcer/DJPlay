from django.db import models
from account.models import User


class Queue(models.Model):
    """Модель очереди Шашек"""

    id = models.AutoField(primary_key=True)
    player = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True, verbose_name="Игрок")

    def __str__(self): return f"Очередь для Шашек {self.id}"
