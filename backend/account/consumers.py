import json
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer, AsyncJsonWebsocketConsumer
from django.utils import timezone
from .services import get_user_by_token


class ConnectingConsumer(AsyncJsonWebsocketConsumer):
    """Consumer изменяющий поле is_online пользователя"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = 'online_users'
        self.room_group_name = self.room_name
        self.user = None

    async def connect(self):
        """При подключении, изменить поле is_online на True"""

        self.room_name = 'online_users'
        self.room_group_name = self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, code):
        """При отключении, изменить поле is_online на False"""

        if self.user is not None:
            self.user.is_online = False
            self.user.last_online = await sync_to_async(timezone.now)()
            await sync_to_async(self.user.save)()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content, **kwargs):
        self.user = await sync_to_async(get_user_by_token)(content.get('access_token'))
        self.user.is_online = True
        await sync_to_async(self.user.save)()
