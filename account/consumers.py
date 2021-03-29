import datetime
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from account.services import get_user_by_token


class ConnectingConsumer(WebsocketConsumer):
    """Consumer изменяющий поле is_online пользователя MainUser"""

    def connect(self):
        """При подключении, изменить поле is_online на True"""

        self.room_name = 'online_users'
        self.room_group_name = self.room_name
        self.user_token = self.scope['cookies']['access']

        user = get_user_by_token(self.user_token)
        user.is_online = True
        user.save()

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    def disconnect(self, code):
        """При отключении, изменить поле is_online на False"""

        user = get_user_by_token(self.user_token)
        user.is_online = False
        user.last_online = datetime.datetime.now()
        user.save()

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )
