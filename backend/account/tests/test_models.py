import io

from PIL import Image
from django.core.files.images import get_image_dimensions
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models
from django.db.models import QuerySet, ProtectedError
from django.test import TestCase
from easy_thumbnails.fields import ThumbnailerImageField

from account.models import User, FriendRequest, Game, UserView
from gomoku.models import Party as GomokuParty, Queue
from gomoku.services import add_gomoku_into_database
from chat.models import Chat


class UserModelFieldsTest(TestCase):
    """Тесты для полей модели пользователя"""

    def setUp(self) -> None:
        self.user = User.objects.create(username="testUser")

    def test_verbose_name(self):
        self.assertEqual('Пользователь', self.user._meta.verbose_name)

    def test_verbose_name_plural(self):
        self.assertEqual('Пользователи', self.user._meta.verbose_name_plural)

    def test_ordering(self):
        self.assertEqual(('username', ), self.user._meta.ordering)

    def test_avatar_type(self):
        field_type = type(self.user._meta.get_field('avatar'))
        self.assertEqual(ThumbnailerImageField, field_type)

    def test_avatar_label(self):
        field_label = self.user._meta.get_field('avatar').verbose_name
        self.assertEqual(field_label, 'Фото профиля')

    def test_avatar_default_url(self):
        default_avatar_url = self.user.avatar.url
        self.assertEqual(default_avatar_url, '/media/avatars/user.png')

    @staticmethod
    def upload_image(width, height):
        image = io.BytesIO()
        Image.new('RGB', (width, height)).save(image, 'PNG')
        image.seek(0)

        return SimpleUploadedFile('avatar.png', image.getvalue())

    def test_avatar_upload_large_image(self):
        image_file = self.upload_image(512, 512)
        self.user.avatar = image_file
        self.user.save()

        width, height = get_image_dimensions(self.user.avatar)
        self.assertEqual((256, 256), (width, height))

    def test_avatar_upload_not_square_image(self):
        self.user.avatar = self.upload_image(1024, 512)
        self.user.save()

        width, height = get_image_dimensions(self.user.avatar)
        self.assertEqual((256, 256), (width, height))

    def test_avatar_upload_image_url(self):
        self.user.avatar = self.upload_image(256, 256)
        self.user.save()
        self.assertEqual(['media', 'avatars'], self.user.avatar.url.split('/')[1:3])

    def test_birthday_type(self):
        field_type = type(self.user._meta.get_field('birthday'))
        self.assertEqual(models.DateField, field_type)

    def test_birthday_label(self):
        field_label = self.user._meta.get_field('birthday').verbose_name
        self.assertEqual('Дата рождения', field_label)

    def test_birthday_default(self):
        field_value = self.user.birthday
        self.assertEqual(None, field_value)

    def test_gender_type(self):
        field_type = type(self.user._meta.get_field('gender'))
        self.assertEqual(models.CharField, field_type)

    def test_gender_label(self):
        field_label = self.user._meta.get_field('gender').verbose_name
        self.assertEqual('Пол', field_label)

    def test_gender_default(self):
        field_value = self.user.gender
        self.assertEqual(None, field_value)

    def test_gender_choices(self):
        field_choices = self.user._meta.get_field('gender').choices
        genders = (
            ('M', 'Мужской'),
            ('F', 'Женский')
        )
        self.assertEqual(genders, field_choices)

    def test_gender_max_length(self):
        field_max_length = self.user._meta.get_field('gender').max_length
        self.assertEqual(1, field_max_length)

    def test_email_type(self):
        field_type = type(self.user._meta.get_field('email'))
        self.assertEqual(models.EmailField, field_type)

    def test_email_label(self):
        field_label = self.user._meta.get_field('email').verbose_name
        self.assertEqual('Эл. почта', field_label)

    def test_email_default(self):
        field_value = self.user.email
        self.assertEqual(None, field_value)

    def test_provider_type(self):
        field_type = type(self.user._meta.get_field('provider'))
        self.assertEqual(models.CharField, field_type)

    def test_provider_label(self):
        field_label = self.user._meta.get_field('provider').verbose_name
        self.assertEqual('Соц. сеть через которую вошел', field_label)

    def test_provider_default(self):
        field_value = self.user.provider
        self.assertEqual('DJPlay', field_value)

    def test_provider_choices(self):
        field_choices = self.user._meta.get_field('provider').choices
        providers = (
            ('DJPlay', 'DJPlay'),
            ('VK', 'VK'),
            ('Google', 'Google')
        )
        self.assertEqual(providers, field_choices)

    def test_provider_max_length(self):
        field_max_length = self.user._meta.get_field('provider').max_length
        self.assertEqual(64, field_max_length)

    def test_last_online_type(self):
        field_type = type(self.user._meta.get_field('last_online'))
        self.assertEqual(models.DateTimeField, field_type)

    def test_last_online_label(self):
        field_label = self.user._meta.get_field('last_online').verbose_name
        self.assertEqual('Был онлайн в', field_label)

    def test_last_online_default(self):
        field_value = self.user.last_online
        self.assertEqual(None, field_value)

    def test_is_online_type(self):
        field_type = type(self.user._meta.get_field('is_online'))
        self.assertEqual(models.BooleanField, field_type)

    def test_is_online_label(self):
        field_label = self.user._meta.get_field('is_online').verbose_name
        self.assertEqual('Онлайн?', field_label)

    def test_is_online_default(self):
        field_value = self.user.is_online
        self.assertFalse(field_value)

    def test_is_private_type(self):
        field_type = type(self.user._meta.get_field('is_private'))
        self.assertEqual(models.BooleanField, field_type)

    def test_is_private_label(self):
        field_label = self.user._meta.get_field('is_private').verbose_name
        self.assertEqual('Приватный аккаунт?', field_label)

    def test_is_private_default(self):
        field_value = self.user.is_private
        self.assertFalse(field_value)

    def test_is_active_type(self):
        field_type = type(self.user._meta.get_field('is_active'))
        self.assertEqual(models.BooleanField, field_type)

    def test_is_active_label(self):
        field_label = self.user._meta.get_field('is_active').verbose_name
        self.assertEqual('Активный аккаунт?', field_label)

    def test_is_active_default(self):
        field_value = self.user.is_active
        self.assertTrue(field_value)


class UserModelMethodsTest(TestCase):
    """Тесты для методов модели пользователей"""

    def setUp(self) -> None:
        self.user = User.objects.create(username="testUser")

    def test_str(self):
        self.assertEqual(self.user.username, str(self.user))

    def test_get_chats_type(self):
        get_chats_type = type(self.user.get_chats())
        self.assertEqual(QuerySet, get_chats_type)

    def test_get_chats_with_self(self):
        chat = Chat.objects.create(user_1=self.user, user_2=self.user)
        self.assertTrue(chat in self.user.get_chats())

    def test_get_chats_with_another_user_1(self):
        test_user_2 = User.objects.create(username="testUser_2")
        chat = Chat.objects.create(user_1=self.user, user_2=test_user_2)
        self.assertTrue(chat in self.user.get_chats())

    def test_get_chats_with_another_user_2(self):
        test_user_2 = User.objects.create(username="testUser_2")
        chat = Chat.objects.create(user_1=test_user_2, user_2=self.user)
        self.assertTrue(chat in self.user.get_chats())

    def test_get_chats_with_many_users(self):
        test_user_2 = User.objects.create(username="testUser_2")
        test_user_3 = User.objects.create(username="testUser_3")
        test_user_4 = User.objects.create(username="testUser_4")

        ids_of_user_chats = [
            Chat.objects.create(user_1=self.user, user_2=test_user_2).id,
            Chat.objects.create(user_1=test_user_3, user_2=self.user).id,
            Chat.objects.create(user_1=self.user, user_2=self.user).id
        ]

        Chat.objects.create(user_1=test_user_2, user_2=test_user_3)
        Chat.objects.create(user_1=test_user_3, user_2=test_user_2)
        Chat.objects.create(user_1=test_user_4, user_2=test_user_4)

        user_chats = Chat.objects.filter(id__in=ids_of_user_chats)
        get_chats_is_correct = True

        if user_chats.count() != self.user.get_chats().count():
            get_chats_is_correct = False
        else:
            for chat in user_chats:
                if chat not in self.user.get_chats():
                    get_chats_is_correct = False
                    break

        self.assertTrue(get_chats_is_correct)

    def test_get_friends_type(self):
        get_friends_type = type(self.user.get_friends())
        self.assertEqual(QuerySet, get_friends_type)

    def test_get_friends_request_from_self_to_self(self):
        FriendRequest.objects.create(request_from=self.user, request_to=self.user, is_active=True)
        self.assertFalse(self.user in self.user.get_friends())

    def test_get_friends_not_active_request_from_self_to_self(self):
        FriendRequest.objects.create(request_from=self.user, request_to=self.user)
        self.assertFalse(self.user in self.user.get_friends())

    def test_get_friends_request_from_not_active_self_to_self(self):
        self.user.is_active = False
        self.user.save()

        FriendRequest.objects.create(request_from=self.user, request_to=self.user, is_active=True)
        self.assertFalse(self.user in self.user.get_friends())

    def test_get_friends_not_active_request_from_not_active_self_to_not_active_self(self):
        self.user.is_active = False
        self.user.save()

        FriendRequest.objects.create(request_from=self.user, request_to=self.user)
        self.assertFalse(self.user in self.user.get_friends())

    def test_get_friends_request_to_another_user(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=self.user, request_to=test_user_2, is_active=True)
        self.assertTrue(test_user_2 in self.user.get_friends())

    def test_get_friends_request_from_another_user(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user, is_active=True)
        self.assertTrue(test_user_2 in self.user.get_friends())

    def test_get_friends_not_active_request_to_user(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=self.user, request_to=test_user_2)
        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_not_active_request_from_user(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user)
        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_request_to_not_active_user(self):
        test_user_2 = User.objects.create(username="testUser2", is_active=False)
        FriendRequest.objects.create(request_from=self.user, request_to=test_user_2)
        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_request_from_not_active_user(self):
        test_user_2 = User.objects.create(username="testUser2", is_active=False)
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user)
        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_request_to_not_active_self(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user, is_active=True)

        self.user.is_active = False
        self.user.save()

        self.assertTrue(test_user_2 in self.user.get_friends())

    def test_get_friends_not_active_request_to_not_active_self(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user)

        self.user.is_active = False
        self.user.save()

        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_request_from_not_active_self_to_not_active_user(self):
        test_user_2 = User.objects.create(username="testUser2", is_active=False)
        FriendRequest.objects.create(request_from=self.user, request_to=test_user_2)

        self.user.is_active = False
        self.user.save()

        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_not_active_request_from_not_active_self_to_not_active_user(self):
        test_user_2 = User.objects.create(username="testUser2", is_active=False)
        FriendRequest.objects.create(request_from=self.user, request_to=test_user_2, is_active=False)

        self.user.is_active = False
        self.user.save()

        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_request_from_not_active_user_to_not_active_self(self):
        test_user_2 = User.objects.create(username="testUser2", is_active=False)
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user)

        self.user.is_active = False
        self.user.save()

        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_not_active_request_from_not_active_user_to_not_active_self(self):
        test_user_2 = User.objects.create(username="testUser2", is_active=False)
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user, is_active=False)

        self.user.is_active = False
        self.user.save()

        self.assertFalse(test_user_2 in self.user.get_friends())

    def test_get_friends_with_many_users(self):
        test_user_2 = User.objects.create(username="testUser2")
        test_user_3 = User.objects.create(username="testUser3")
        test_user_4 = User.objects.create(username="testUser4", is_active=False)
        test_user_5 = User.objects.create(username="testUser5")

        ids_of_friends = []

        FriendRequest.objects.create(request_from=test_user_2, request_to=test_user_3, is_active=True)
        FriendRequest.objects.create(request_from=test_user_3, request_to=test_user_4, is_active=True)
        ids_of_friends.append(
            FriendRequest.objects.create(request_from=self.user, request_to=test_user_2, is_active=True).id
        )
        FriendRequest.objects.create(request_from=test_user_4, request_to=self.user, is_active=True)
        FriendRequest.objects.create(request_from=self.user, request_to=test_user_3)
        FriendRequest.objects.create(request_from=self.user, request_to=self.user, is_active=True)
        FriendRequest.objects.create(request_from=test_user_5, request_to=test_user_2)
        ids_of_friends.append(
            FriendRequest.objects.create(request_from=test_user_5, request_to=self.user, is_active=True).id
        )

        is_get_friends_correct = True
        get_friends_queryset = self.user.get_friends()
        correct_friends_request_queryset = FriendRequest.objects.filter(id__in=ids_of_friends)

        if correct_friends_request_queryset.count() != get_friends_queryset.count():
            is_get_friends_correct = False
        else:
            for fq in correct_friends_request_queryset:
                if fq.get_friend(self.user) not in get_friends_queryset:
                    is_get_friends_correct = False
                    break

        self.assertTrue(is_get_friends_correct)

    def test_get_gomoku_party_list_type(self):
        add_gomoku_into_database()
        gomoku = Game.objects.get(app_name='gomoku')
        get_party_list_type = type(self.user.get_party_list(gomoku))
        self.assertEqual(QuerySet, get_party_list_type)

    def test_get_gomoku_party_list(self):
        add_gomoku_into_database()
        gomoku = Game.objects.get(app_name='gomoku')
        test_user_2 = User.objects.create(username="testUser2")
        test_user_3 = User.objects.create(username="testUser3")
        test_user_4 = User.objects.create(username="testUser4", is_active=False)

        ids_of_parties = []

        GomokuParty.objects.create(player_1=test_user_2, player_2=test_user_4, game=gomoku)
        GomokuParty.objects.create(player_1=test_user_2, player_2=test_user_4, game=gomoku)
        GomokuParty.objects.create(player_1=test_user_4, player_2=test_user_2, game=gomoku)
        ids_of_parties.append(
            GomokuParty.objects.create(player_1=test_user_3, player_2=self.user, game=gomoku).id
        )
        ids_of_parties.append(
            GomokuParty.objects.create(player_1=self.user, player_2=test_user_3, game=gomoku).id
        )
        GomokuParty.objects.create(player_1=test_user_2, player_2=test_user_3, game=gomoku)
        ids_of_parties.append(
            GomokuParty.objects.create(player_1=self.user, player_2=test_user_2, game=gomoku).id
        )
        GomokuParty.objects.create(player_1=self.user, player_2=self.user, game=gomoku)
        GomokuParty.objects.create(player_1=test_user_4, player_2=test_user_3, game=gomoku)
        ids_of_parties.append(
            GomokuParty.objects.create(player_1=self.user, player_2=test_user_2, game=gomoku).id
        )
        GomokuParty.objects.create(player_1=test_user_2, player_2=test_user_2, game=gomoku)
        ids_of_parties.append(
            GomokuParty.objects.create(player_1=test_user_4, player_2=self.user, game=gomoku).id
        )
        GomokuParty.objects.create(player_1=test_user_3, player_2=test_user_2, game=gomoku)
        ids_of_parties.append(
            GomokuParty.objects.create(player_1=self.user, player_2=test_user_3, game=gomoku).id
        )

        is_get_gomoku_party_list_correct = True
        correct_gomoku_party_list_queryset = GomokuParty.objects.filter(id__in=ids_of_parties)
        get_gomoku_party_list_queryset = self.user.get_party_list(gomoku)

        if correct_gomoku_party_list_queryset.count() != get_gomoku_party_list_queryset.count():
            is_get_gomoku_party_list_correct = False
        else:
            for gomoku_party in correct_gomoku_party_list_queryset:
                if gomoku_party not in get_gomoku_party_list_queryset:
                    is_get_gomoku_party_list_correct = False
                    break

        self.assertTrue(is_get_gomoku_party_list_correct)

    def test_get_viewers_type(self):
        self.assertEqual(QuerySet, type(self.user.get_viewers()))

    def test_get_viewers_with_self(self):
        UserView.objects.create(view_from=self.user, view_to=self.user)
        self.assertEqual(0, self.user.get_viewers().count())

    def test_get_viewers_with_user(self):
        test_user_2 = User.objects.create(username="testUser2")
        UserView.objects.create(view_from=test_user_2, view_to=self.user)
        self.assertTrue(test_user_2 in self.user.get_viewers())

    def test_get_viewers_to_user_repeatedly(self):
        test_user_2 = User.objects.create(username="testUser2")
        UserView.objects.create(view_from=test_user_2, view_to=self.user)
        UserView.objects.create(view_from=test_user_2, view_to=self.user)
        self.assertEqual(1, self.user.get_viewers().count())

    def test_get_viewers_with_many_users(self):
        test_user_2 = User.objects.create(username="testUser2")
        test_user_3 = User.objects.create(username="testUser3")
        test_user_4 = User.objects.create(username="testUser4")

        ids_of_user_viewers = []

        UserView.objects.create(view_from=test_user_2, view_to=test_user_3)
        UserView.objects.create(view_from=test_user_2, view_to=test_user_4)
        ids_of_user_viewers.append(
            UserView.objects.create(view_from=test_user_3, view_to=self.user).id
        )
        UserView.objects.create(view_from=test_user_3, view_to=self.user)
        ids_of_user_viewers.append(
            UserView.objects.create(view_from=test_user_4, view_to=self.user).id
        )
        UserView.objects.create(view_from=self.user, view_to=test_user_2)
        UserView.objects.create(view_from=test_user_4, view_to=test_user_2)
        UserView.objects.create(view_from=self.user, view_to=self.user)
        UserView.objects.create(view_from=test_user_4, view_to=test_user_4)

        is_get_viewers_correct = True
        get_viewers_queryset = self.user.get_viewers()
        correct_user_views_queryset = UserView.objects.filter(id__in=ids_of_user_viewers)

        if correct_user_views_queryset.count() != get_viewers_queryset.count():
            is_get_viewers_correct = False
        else:
            for user_view in correct_user_views_queryset:
                if user_view.view_from not in get_viewers_queryset:
                    is_get_viewers_correct = False
                    break

        self.assertTrue(is_get_viewers_correct)

    def test_has_access_to_view_data_of_another_user_type(self):
        test_user_2 = User.objects.create(username="userUser2")
        result_type = type(test_user_2.has_access_to_view_data_of_another_user(self.user))
        self.assertEqual(bool, result_type)

    def test_has_access_to_view_data_of_self(self):
        self.assertTrue(self.user.has_access_to_view_data_of_another_user(self.user))

    def test_has_access_to_view_data_of_another_user(self):
        test_user_2 = User.objects.create(username="testUser2")
        self.assertTrue(test_user_2.has_access_to_view_data_of_another_user(self.user))

    def test_has_access_to_view_data_of_private_user(self):
        test_user_2 = User.objects.create(username="testUser2", is_private=True)
        self.assertFalse(test_user_2.has_access_to_view_data_of_another_user(self.user))

    def test_has_access_to_view_data_of_friend(self):
        test_user_2 = User.objects.create(username="testUser2")
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user, is_active=True)
        self.assertTrue(test_user_2.has_access_to_view_data_of_another_user(self.user))

    def test_has_access_to_view_data_of_private_friend(self):
        test_user_2 = User.objects.create(username="testUser2", is_private=True)
        FriendRequest.objects.create(request_from=test_user_2, request_to=self.user, is_active=True)
        self.assertTrue(test_user_2.has_access_to_view_data_of_another_user(self.user))


class GameTestCase(TestCase):
    """Тесты для модели игры"""

    def setUp(self) -> None:
        add_gomoku_into_database()
        self.gomoku = Game.objects.get(app_name="gomoku")

    def test_name_type(self):
        field_type = type(self.gomoku._meta.get_field('name'))
        self.assertEqual(models.CharField, field_type)

    def test_name_label(self):
        field_label = self.gomoku._meta.get_field('name').verbose_name
        self.assertEqual('Название игры', field_label)

    def test_name_max_length(self):
        field_max_length = self.gomoku._meta.get_field('name').max_length
        self.assertEqual(64, field_max_length)

    def test_app_name_type(self):
        field_type = type(self.gomoku._meta.get_field('app_name'))
        self.assertEqual(models.CharField, field_type)

    def test_app_name_label(self):
        field_label = self.gomoku._meta.get_field('app_name').verbose_name
        self.assertEqual('Название приложения', field_label)

    def test_app_name_max_length(self):
        field_max_length = self.gomoku._meta.get_field('app_name').max_length
        self.assertEqual(64, field_max_length)

    def test_rules_type(self):
        field_type = type(self.gomoku._meta.get_field('rules'))
        self.assertEqual(models.TextField, field_type)

    def test_rules_label(self):
        field_label = self.gomoku._meta.get_field('rules').verbose_name
        self.assertEqual('Правила игры', field_label)

    def test_image_type(self):
        field_type = type(self.gomoku._meta.get_field('image'))
        self.assertEqual(models.ImageField, field_type)

    def test_image_label(self):
        field_label = self.gomoku._meta.get_field('image').verbose_name
        self.assertEqual('Обложка', field_label)

    def test_image_for_null(self):
        field_none = self.gomoku._meta.get_field('image').null
        self.assertTrue(field_none)

    def test_image_for_blank(self):
        field_blank = self.gomoku._meta.get_field('image').blank
        self.assertTrue(field_blank)

    def test_is_realeased_type(self):
        field_type = type(self.gomoku._meta.get_field('is_released'))
        self.assertEqual(models.BooleanField, field_type)

    def test_is_realeased_label(self):
        field_label = self.gomoku._meta.get_field('is_released').verbose_name
        self.assertEqual('Выпущена ли игра?', field_label)

    def test_is_released_default(self):
        field_default = self.gomoku._meta.get_field('is_released').default
        self.assertFalse(field_default)

    def test_str(self):
        self.assertEqual('Гомоку', str(self.gomoku))


class QueueModelTest(TestCase):
    """Тесты для модели очереди"""

    def setUp(self) -> None:
        add_gomoku_into_database()
        self.gomoku = Game.objects.get(app_name='gomoku')
        self.queue = Queue.objects.create(game=self.gomoku)
        self.test_user_1 = User.objects.create(username="testUser1")
        self.test_user_2 = User.objects.create(username="testUser2")

    def test_verbose_name(self):
        self.assertEqual('Очередь для игры', self.queue._meta.verbose_name)

    def test_verbose_name_plural(self):
        self.assertEqual('Очереди для игр', self.queue._meta.verbose_name_plural)

    def test_game_type(self):
        field_type = type(self.queue._meta.get_field('game'))
        self.assertEqual(models.ForeignKey, field_type)

    def test_game_label(self):
        field_label = self.queue._meta.get_field('game').verbose_name
        self.assertEqual('Очередь для', field_label)

    def test_game_to(self):
        field_to = type(self.queue.game)
        self.assertEqual(Game, field_to)

    def test_game_on_delete(self):
        self.gomoku.delete()
        self.assertEqual(0, Queue.objects.count())

    def test_player_1_type(self):
        field_type = type(self.queue._meta.get_field('player_1'))
        self.assertEqual(models.ForeignKey, field_type)

    def test_player_1_label(self):
        field_label = self.queue._meta.get_field('player_1').verbose_name
        self.assertEqual('Игрок 1', field_label)

    def test_player_1_to(self):
        self.queue.player_1 = self.test_user_1
        self.queue.save()
        field_to = type(self.queue.player_1)
        self.assertEqual(User, field_to)

    def test_player_1_on_delete(self):
        self.queue.player_1 = self.test_user_1
        self.queue.save()
        self.test_user_1.delete()
        queue = Queue.objects.get(game=self.gomoku)
        self.assertEqual(None, queue.player_1)

    def test_str(self):
        self.assertEqual('Очередь для Гомоку', str(self.queue))

    def test_update_queue(self):
        self.queue.update_queue(self.test_user_1)
        self.assertEqual(self.test_user_1, self.queue.player_1)

    def test_update_queue_for_clear(self):
        self.queue.update_queue(self.test_user_1)
        self.queue.update_queue(clear=True)
        self.assertEqual(None, self.queue.player_1)

    def test_update_queue_for_one_player_twice(self):
        self.queue.update_queue(self.test_user_1)
        self.queue.update_queue(self.test_user_1)
        self.assertEqual(self.test_user_1, self.queue.player_1)

    def test_update_queue_for_two_players(self):
        self.queue.update_queue(self.test_user_1)
        self.queue.update_queue(self.test_user_2)
        self.assertEqual((1, None), (GomokuParty.objects.count(), self.queue.player_1))


class FriendRequestModelTest(TestCase):
    """Тесты для модели запроса в друзья"""

    def setUp(self) -> None:
        self.test_user_1 = User.objects.create(username="testUser1")
        self.test_user_2 = User.objects.create(username="testUser2")
        self.fq = FriendRequest.objects.create(
            request_from=self.test_user_1,
            request_to=self.test_user_2,
            is_active=True
        )

    def test_verbose_name(self):
        self.assertEqual('Запрос в друзья', self.fq._meta.verbose_name)

    def test_verbose_name_plural(self):
        self.assertEqual('Запросы в друзья', self.fq._meta.verbose_name_plural)

    def test_request_from_type(self):
        field_type = type(self.fq._meta.get_field('request_from'))
        self.assertEqual(models.ForeignKey, field_type)

    def test_request_from_label(self):
        field_label = self.fq._meta.get_field('request_from').verbose_name
        self.assertEqual('Запрос от', field_label)

    def test_request_from_on_delete(self):
        try:
            self.test_user_1.delete()
            self.assertTrue(False)
        except ProtectedError:
            self.assertTrue(True)

    def test_request_to_type(self):
        field_type = type(self.fq._meta.get_field('request_to'))
        self.assertEqual(models.ForeignKey, field_type)

    def test_request_to_label(self):
        field_label = self.fq._meta.get_field('request_to').verbose_name
        self.assertEqual('Запрос к', field_label)

    def test_request_to_on_delete(self):
        try:
            self.test_user_1.delete()
            self.assertTrue(False)
        except ProtectedError:
            self.assertTrue(True)

    def test_str(self):
        self.assertEqual('От testUser1 к testUser2', str(self.fq))

    def get_friend(self):
        self.assertEqual(self.test_user_1, self.fq.get_friend(self.test_user_2))


class UserViewModelTest(TestCase):
    """Тесты для модели просмотра пользователя"""

    def setUp(self) -> None:
        self.test_user_1 = User.objects.create(username="testUser1")
        self.test_user_2 = User.objects.create(username="testUser2")
        self.user_view = UserView.objects.create(view_from=self.test_user_1, view_to=self.test_user_2)

    def test_verbose_name(self):
        self.assertEqual('Просмотр пользователя', self.user_view._meta.verbose_name)

    def test_verbose_name_plural(self):
        self.assertEqual('Просмотры пользователей', self.user_view._meta.verbose_name_plural)

    def test_view_from_type(self):
        field_type = type(self.user_view._meta.get_field('view_from'))
        self.assertEqual(models.ForeignKey, field_type)

    def test_view_from_label(self):
        field_label = self.user_view._meta.get_field('view_from').verbose_name
        self.assertEqual('Просмотр от', field_label)

    def test_view_from_on_delete(self):
        try:
            self.test_user_1.delete()
            self.assertTrue(False)
        except ProtectedError:
            self.assertTrue(True)

    def test_view_to_type(self):
        field_type = type(self.user_view._meta.get_field('view_to'))
        self.assertEqual(models.ForeignKey, field_type)

    def test_view_to_label(self):
        field_label = self.user_view._meta.get_field('view_to').verbose_name
        self.assertEqual('Просмотр к', field_label)

    def test_view_to_on_delete(self):
        try:
            self.test_user_2.delete()
            self.assertTrue(True)
        except ProtectedError:
            self.assertTrue(False)

    def test_str(self):
        self.assertEqual('От testUser1 к testUser2', str(self.user_view))
