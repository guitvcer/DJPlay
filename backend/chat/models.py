from django.db import models
from account.models import User


class Chat(models.Model):
    """Модель чата"""

    id = models.AutoField(primary_key=True)
    user_1 = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Пользователь 1',
                               related_name='chat_user_1')
    user_2 = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Пользователь 2',
                               related_name='chat_user_2')

    def __str__(self):
        return f'{self.user_1} - {self.user_2}'

    def get_interlocutor(self, user: User) -> User:
        return self.user_2 if user == self.user_1 else self.user_1

    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'


class Message(models.Model):
    """Модель сообщения в чате"""

    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name="Чат")
    text = models.CharField(max_length=256, verbose_name="Текст")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Дата")
    sent_from = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Отправитель")

    def __str__(self): return f'Чат №{self.chat.id}, {self.sent_from}'

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ('date', )
