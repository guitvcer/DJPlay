from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse


class MainUser(AbstractUser):
    """Модель основного пользователя"""

    avatar = models.ImageField(default="/user.png", verbose_name="Фото профиля")
    birthday = models.DateField(null=True, blank=True, verbose_name="Дата рождения")
    gender = models.CharField(null=True, blank=True, max_length=1, choices=(('M', 'Мужской'), ('F', 'Женский')),
                              verbose_name="Пол")
    last_online = models.DateTimeField(null=True, blank=True, verbose_name="Был онлайн в")
    is_online = models.BooleanField(default=False, verbose_name="Онлайн?")
    is_private = models.BooleanField(default=False, verbose_name="Приватный аккаунт?")

    # rating = models.PositiveIntegerField(verbose_name='Рейтинг', default=1000)
    # rank = models.CharField(verbose_name='Звание', default='Четвертый разряд', max_length=64)

    def __str__(self):
        return self.username

    def get_absolute_url(self):
        return reverse('account:users_profile', args=(self.username, ))

    def get_friends(self):
        """Получить QuerySet из друзей"""

        fqs = []
        active_users = MainUser.objects.filter(is_active=True).exclude(id=self.id)

        for active_user in active_users:
            try:
                fqs.append(FriendRequest.objects.get(
                    request_from=self, request_to=active_user, is_active=True))
            except FriendRequest.DoesNotExist:
                try:
                    fqs.append(FriendRequest.objects.get(
                        request_from=active_user, request_to=self, is_active=True))
                except FriendRequest.DoesNotExist:
                    pass

        friends = []

        for fq in fqs:
            for active_user in active_users:
                if active_user.id == fq.request_to.id:
                    friends.append(active_user)
                elif active_user.id == fq.request_from.id:
                    friends.append(active_user)

        return friends

    def get_gomoku_parties(self):
        """Получить сыгранные партии Гомоку"""

        from gomoku.models import Party

        return Party.objects.filter(player1=self).union(Party.objects.filter(player2=self)).order_by('-date')

    def get_views(self):
        """Получить пользователей, которое просматривали страницу этого пользователя"""

        list_of_ids = []
        views = MainUserView.objects.filter(view_to=self)

        for view in views:
            list_of_ids.append(view.view_from.id)

        queryset = MainUser.objects.filter(id__in=list_of_ids)

        return queryset

    def is_access_to_data(self, user):
        """Есть ли доступ user'у просматривать данные этого пользователя"""

        return user != self and not self.is_private or user in self.get_friends or user == self

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ('username', )


class Game(models.Model):
    """Модель игры"""

    name = models.CharField(max_length=64, verbose_name="Название игры")
    app_name = models.CharField(max_length=64, verbose_name="Название приложения")
    rules = models.TextField(verbose_name="Правила игры")
    image = models.ImageField(null=True, blank=True, verbose_name="Обложка")
    is_released = models.BooleanField(default=False, verbose_name="Выпущена ли игра?")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'


class Queue(models.Model):
    """Модель очереди для игры"""

    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Очередь для")
    player1 = models.ForeignKey(MainUser, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Игрок 1")

    def __str__(self):
        return self.game.name

    class Meta:
        verbose_name = 'Очередь для игры'
        verbose_name_plural = 'Очереди для игр'


class FriendRequest(models.Model):
    """Модель для добавления/удаления друзей"""

    request_from = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Запрос на дружбу от",
                                     related_name="+")

    request_to = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Запрос на дружбу к",
                                   related_name="+")

    is_active = models.BooleanField(default=False, verbose_name="Принят ли запрос?")

    def __str__(self):
        return f'От {self.request_from} к {self.request_to}'

    class Meta:
        verbose_name = 'Запрос на дружбу'
        verbose_name_plural = 'Запросы на дружбу'


class MainUserView(models.Model):
    """Модель просмотров пользователя"""

    view_from = models.ForeignKey(MainUser, on_delete=models.PROTECT, verbose_name="Просмотр от", related_name="+")
    view_to = models.ForeignKey(MainUser, on_delete=models.CASCADE, verbose_name="Просмотр к", related_name="+")

    def __str__(self):
        return f'От {self.view_from} к {self.view_to}'

    class Meta:
        verbose_name = 'Просмотр пользователя'
        verbose_name_plural = 'Просмотры пользователя'
