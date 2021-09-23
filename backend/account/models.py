from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import QuerySet
from easy_thumbnails.fields import ThumbnailerImageField


class UserManager(models.Manager):
    """Custom Manager для модели User, возвращается неудаленные аккаунты (is_active=True)"""

    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)


class User(AbstractUser):
    """Модель пользователя"""

    GENDERS = (
        ('M', 'Мужской'),
        ('F', 'Женский')
    )
    PROVIDERS = (
        ('DJPlay', 'DJPlay'),
        ('VK', 'VK'),
        ('Google', 'Google')
    )

    id = models.AutoField(primary_key=True)
    avatar = ThumbnailerImageField(default="/avatars/user.png", verbose_name="Фото профиля", upload_to='avatars',
                                   resize_source={
                                       'quality': 95,
                                       'size': (256, 256),
                                       'sharpen': True,
                                       'crop': 'square'
                                   })
    birthday = models.DateField(null=True, blank=True, verbose_name="Дата рождения")
    gender = models.CharField(null=True, blank=True, max_length=1, choices=GENDERS, verbose_name="Пол")
    email = models.EmailField(null=True, blank=True, max_length=64, verbose_name="Эл.почта")
    provider = models.CharField(default="DJPlay", choices=PROVIDERS, max_length=64,
                                verbose_name="Соц. сеть через которую вошел")
    last_online = models.DateTimeField(null=True, blank=True, verbose_name="Был онлайн в")
    is_online = models.BooleanField(default=False, verbose_name="Онлайн?")
    is_private = models.BooleanField(default=False, verbose_name="Приватный аккаунт?")
    is_active = models.BooleanField(default=True, verbose_name="Активный аккаунт?")

    active = UserManager()

    def __str__(self): return self.username

    def get_chats(self) -> QuerySet:
        """Получить список чатов"""

        from chat.models import Chat

        list_of_ids = [chat.id for chat in Chat.objects.all() if self in (chat.user_1, chat.user_2)]
        queryset = Chat.objects.filter(id__in=list_of_ids)

        return queryset

    def get_friends(self) -> QuerySet:
        """Получить QuerySet из друзей"""

        fqs = []
        active_users = User.active.all()

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

        ids_friends = [fq.get_friend(self).id for fq in fqs]

        return User.objects.filter(id__in=ids_friends)

    def get_party_list(self, game) -> QuerySet:
        """Получить QuerySet из сыгранных партии определенной игры"""

        if game.app_name == 'gomoku':
            from gomoku.models import Party

            return Party.objects.filter(player_1=self).union(Party.objects.filter(player_2=self)).order_by('-date')

    def get_viewers(self) -> QuerySet:
        """Получить пользователей, которое просматривали страницу этого пользователя"""

        views = UserView.objects.filter(view_to=self)
        list_of_ids = [view.view_from.id for view in views]
        queryset = User.objects.filter(id__in=list_of_ids)

        return queryset

    def has_access_to_view_data_of_another_user(self, user) -> bool:
        """Может ли user просматривать данные этого пользователя"""

        return (self == user) or (user in self.get_friends()) or not self.is_private

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ('username', )


class Game(models.Model):
    """Модель игры"""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=64, verbose_name="Название игры")
    app_name = models.CharField(max_length=64, verbose_name="Название приложения")
    rules = models.TextField(verbose_name="Правила игры")
    image = models.ImageField(null=True, blank=True, verbose_name="Обложка")
    is_released = models.BooleanField(default=False, verbose_name="Выпущена ли игра?")

    def __str__(self): return self.name

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'


class Queue(models.Model):
    """Модель очереди для игры"""

    id = models.AutoField(primary_key=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Очередь для")
    player_1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Игрок 1")

    def __str__(self): return self.game.name

    @staticmethod
    def update_queue(queue, player: User):
        if player is None:
            queue.player_1 = None
            queue.save()
            return

        if queue.player_1 is None:
            queue.player_1 = player
            queue.save()
        elif queue.player_1 == player:
            queue.player_1 = None
            queue.save()
        else:
            # если очередь заполнена, создается игра и очищается очередь

            gomoku = Game.objects.get(app_name="gomoku")
            party = queue.game.party_set.create(player_1=queue.player_1, player_2=player, game=gomoku)
            queue.player_1 = None
            queue.save()

            return party

    class Meta:
        verbose_name = 'Очередь для игры'
        verbose_name_plural = 'Очереди для игр'


class FriendRequest(models.Model):
    """Модель для добавления/удаления друзей"""

    id = models.AutoField(primary_key=True)
    request_from = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Запрос на дружбу от",
                                     related_name="friend_request_from")
    request_to = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Запрос на дружбу к",
                                   related_name="friend_request_to")
    is_active = models.BooleanField(default=False, verbose_name="Принят ли запрос?")

    def __str__(self): return f'От {self.request_from} к {self.request_to}'

    def get_friend(self, user: User) -> User:
        return self.request_from if user == self.request_to else self.request_to

    class Meta:
        verbose_name = 'Запрос на дружбу'
        verbose_name_plural = 'Запросы на дружбу'


class UserView(models.Model):
    """Модель просмотров пользователя"""

    id = models.AutoField(primary_key=True)
    view_from = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Просмотр от",
                                  related_name="user_view_from")
    view_to = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Просмотр к", related_name="user_view_to")

    def __str__(self): return f'От {self.view_from} к {self.view_to}'

    class Meta:
        verbose_name = 'Просмотр пользователя'
        verbose_name_plural = 'Просмотры пользователя'
