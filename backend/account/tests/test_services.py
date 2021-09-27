from django.test import TestCase
from account import services
from account.models import User, FriendRequest
from account.serializers import UserInfoSerializer


class ServicesTest(TestCase):
    """Тесты для модуля services"""

    def setUp(self) -> None:
        self.user_1 = User.objects.create(username="user")
        self.user_2 = User.objects.create(username="user_2")

    def test_get_user_by_token_and_generate_tokens(self):
        access = services.generate_tokens(self.user_1)['access']
        self.assertEqual(self.user_1, services.get_user_by_token(access))

    def test_create_friend_request(self):
        function_result = services.create_or_delete_or_accept_friend_request(self.user_1, self.user_2)
        FriendRequest.objects.get(request_from=self.user_1, request_to=self.user_2, is_active=False)
        self.assertEqual("Вы отправили запрос на дружбу.", function_result)

    def test_accept_friend_request(self):
        services.create_or_delete_or_accept_friend_request(self.user_1, self.user_2)
        function_result = services.create_or_delete_or_accept_friend_request(self.user_2, self.user_1)
        FriendRequest.objects.get(request_from=self.user_1, request_to=self.user_2, is_active=True)
        self.assertEqual("Вы приняли запрос на дружбу.", function_result)

    def test_cancel_friend_request(self):
        services.create_or_delete_or_accept_friend_request(self.user_1, self.user_2)
        function_result = services.create_or_delete_or_accept_friend_request(self.user_1, self.user_2)

        try:
            FriendRequest.objects.get(request_from=self.user_1, request_to=self.user_2)
            self.assertTrue(False)
        except FriendRequest.DoesNotExist:
            self.assertEqual("Вы отменили запрос на дружбу.", function_result)

    def test_remove_friend_request(self):
        services.create_or_delete_or_accept_friend_request(self.user_1, self.user_2)
        services.create_or_delete_or_accept_friend_request(self.user_2, self.user_1)
        function_result = services.create_or_delete_or_accept_friend_request(self.user_1, self.user_2)

        try:
            FriendRequest.objects.get(request_from=self.user_1, request_to=self.user_2)
            self.assertTrue(False)
        except FriendRequest.DoesNotExist:
            self.assertEqual("Вы удалили пользователя из друзей.", function_result)

    def test_get_user_profile_info(self):
        pass
