import humps
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from account.models import User
from account.services import get_user_by_token
from .models import Message
from .serializers import MessageSerializer
from .services import get_or_create_chat


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """Consumer чата"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = 'chat'
        self.room_group_name = 'chat'
        self.chat = None
        self.user = None

    async def connect(self):
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content, **kwargs):
        if self.user is None:
            access_token = content.get('access_token')
            interlocutor_username = self.scope['url_route']['kwargs']['username']
            interlocutor = await sync_to_async(User.objects.get)(username=interlocutor_username)

            await self.disconnect(None)

            self.user = await sync_to_async(get_user_by_token)(access_token)
            self.chat = await sync_to_async(get_or_create_chat)(self.user, interlocutor)
            self.room_group_name = 'chat_%s' % self.chat.id

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        else:
            text = await sync_to_async(content.get)('text')

            if text is None:
                return

            message = await sync_to_async(Message.objects.create)(chat=self.chat, sent_from=self.user, text=text)
            serializer = MessageSerializer(message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notify_room',
                    'message': serializer.data
                }
            )

    async def notify_room(self, event):
        event['message'] = humps.camelize(event['message'])
        await self.send_json(event)
