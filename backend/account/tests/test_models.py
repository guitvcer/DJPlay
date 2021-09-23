import io

from PIL import Image
from django.core.files.images import get_image_dimensions
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models
from django.test import TestCase
from easy_thumbnails.fields import ThumbnailerImageField

from account.models import User


class UserModelFieldsTest(TestCase):
    """Тесты для полей модели пользователя"""

    def setUp(self) -> None:
        self.user = User.objects.create(username="testUser", email="testUser@example.com")

    def test_avatar_type(self):
        field_type = type(self.user._meta.get_field('avatar'))
        self.assertEquals(ThumbnailerImageField, field_type)

    def test_avatar_label(self):
        field_label = self.user._meta.get_field('avatar').verbose_name
        self.assertEquals(field_label, 'Фото профиля')

    def test_avatar_default_url(self):
        default_avatar_url = self.user.avatar.url
        self.assertEquals(default_avatar_url, '/media/avatars/user.png')

    @staticmethod
    def upload_image(width, height):
        image = io.BytesIO()
        Image.new('RGB', (width, height)).save(image, 'PNG')
        image.seek(0)

        return SimpleUploadedFile('avatar.png', image.getvalue())

    # def test_avatar_upload_small_image(self):
    #     user = self.user
    #
    #     user.avatar = self.upload_image(64, 32)
    #     user.save()
    #     width, height = get_image_dimensions(user.avatar)
    #
    #     self.assertEquals((32, 32), (width, height))

    def test_avatar_upload_large_image(self):
        image_file = self.upload_image(512, 512)
        self.user.avatar = image_file
        self.user.save()

        width, height = get_image_dimensions(self.user.avatar)
        self.assertEquals((256, 256), (width, height))

    def test_avatar_upload_not_square_image(self):
        self.user.avatar = self.upload_image(1024, 512)
        self.user.save()

        width, height = get_image_dimensions(self.user.avatar)
        self.assertEquals((256, 256), (width, height))

    def test_avatar_upload_image_url(self):
        self.user.avatar = self.upload_image(256, 256)
        self.user.save()
        self.assertEquals(['media', 'avatars'], self.user.avatar.url.split('/')[1:3])

    def test_birthday_type(self):
        field_type = type(self.user._meta.get_field('birthday'))
        self.assertEquals(models.DateField, field_type)

    def test_birthday_label(self):
        field_label = self.user._meta.get_field('birthday').verbose_name
        self.assertEquals('Дата рождения', field_label)

    def test_birthday_default(self):
        field_value = self.user.birthday
        self.assertEquals(None, field_value)

    def test_gender_type(self):
        field_type = type(self.user._meta.get_field('gender'))
        self.assertEquals(models.CharField, field_type)

    def test_gender_label(self):
        field_label = self.user._meta.get_field('gender').verbose_name
        self.assertEquals('Пол', field_label)

    def test_gender_default(self):
        field_value = self.user.gender
        self.assertEquals(None, field_value)

    def test_gender_choices(self):
        field_choices = self.user._meta.get_field('gender').choices
        genders = (
            ('M', 'Мужской'),
            ('F', 'Женский')
        )
        self.assertEquals(genders, field_choices)

    def test_gender_max_length(self):
        field_max_length = self.user._meta.get_field('gender').max_length
        self.assertEquals(1, field_max_length)

    def test_provider_type(self):
        field_type = type(self.user._meta.get_field('provider'))
        self.assertEquals(models.CharField, field_type)

    def test_provider_label(self):
        field_label = self.user._meta.get_field('provider').verbose_name
        self.assertEquals('Соц. сеть через которую вошел', field_label)

    def test_provider_default(self):
        field_value = self.user.provider
        self.assertEquals('DJPlay', field_value)

    def test_provider_choices(self):
        field_choices = self.user._meta.get_field('provider').choices
        providers = (
            ('DJPlay', 'DJPlay'),
            ('VK', 'VK'),
            ('Google', 'Google')
        )
        self.assertEquals(providers, field_choices)

    def test_provider_max_length(self):
        field_max_length = self.user._meta.get_field('provider').max_length
        self.assertEquals(64, field_max_length)

    def test_last_online_type(self):
        field_type = type(self.user._meta.get_field('last_online'))
        self.assertEquals(models.DateTimeField, field_type)

    def test_last_online_label(self):
        field_label = self.user._meta.get_field('last_online').verbose_name
        self.assertEquals('Был онлайн в', field_label)

    def test_last_online_default(self):
        field_value = self.user.last_online
        self.assertEquals(None, field_value)

    def test_is_online_type(self):
        field_type = type(self.user._meta.get_field('is_online'))
        self.assertEquals(models.BooleanField, field_type)

    def test_is_online_label(self):
        field_label = self.user._meta.get_field('is_online').verbose_name
        self.assertEquals('Онлайн?', field_label)

    def test_is_online_default(self):
        field_value = self.user.is_online
        self.assertFalse(field_value)

    def test_is_private_type(self):
        field_type = type(self.user._meta.get_field('is_private'))
        self.assertEquals(models.BooleanField, field_type)

    def test_is_private_label(self):
        field_label = self.user._meta.get_field('is_private').verbose_name
        self.assertEquals('Приватный аккаунт?', field_label)

    def test_is_private_default(self):
        field_value = self.user.is_private
        self.assertFalse(field_value)

    def test_is_active_type(self):
        field_type = type(self.user._meta.get_field('is_active'))
        self.assertEquals(models.BooleanField, field_type)

    def test_is_active_label(self):
        field_label = self.user._meta.get_field('is_active').verbose_name
        self.assertEquals('Активный аккаунт?', field_label)

    def test_is_active_default(self):
        field_value = self.user.is_active
        self.assertTrue(field_value)
