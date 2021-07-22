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


class ChatConsumer(WebsocketConsumer):
    """Consumer чата"""

    def connect(self):
        """Подключение"""

        self.room_name = 'chat'
        self.room_group_name = self.room_name
        self.user_token = self.scope['cookies']['access']
        self.user = get_user_by_token(self.user_token)

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    def disconnect(self, code):
        """Отключение"""

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    def receive(self, text_data):
        """Получение сообщений"""

        text_data = json.loads(text_data)
        message = text_data['message']
        interlocutor = text_data['interlocutor']
        type = None
        message = create_message(self.user, interlocutor, message)

        if message == 'Максимальное количество знаков - 256':
            type = 'error'
            self.send(text_data=json.dumps({
                'type': type,
                'text': message,
            }))
        else:
            type = 'message'
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'sent_from': message.sent_from.username,
                    'sent_to': message.sent_to.username,
                    'message': message.text,
                    'message_type': type,
                }
            )

    def send_message(self, event):
        """Отправить сообщение"""

        message = {
            'sent_from': event['sent_from'],
            'sent_to': event['sent_to'],
            'text': event['message'],
            'type': event['message_type'],
        }

        self.send(text_data=json.dumps(message))
