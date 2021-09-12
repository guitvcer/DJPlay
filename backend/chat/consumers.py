import humps
from asgiref.sync import sync_to_async
from channels.exceptions import RequestAborted
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from account.services import get_user_by_token
from .models import Chat, Message
from .serializers import MessageSerializer


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
        if self.user is not None:
            self.user.is_online = False
            self.user.last_online = timezone.now()
            await sync_to_async(self.user.save)()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content, **kwargs):
        try:
            await self.get_user_and_add_to_group(content)
            await self.add_to_specific_chat_group(content)
            await self.create_message_and_notify_users(content)
        except RequestAborted:
            await self.send_json({
                'status': 400
            })

    async def get_user_and_add_to_group(self, content):
        """После подключения к сокету, получаем токен и записываем пользователя добавив в новую группу"""

        if self.user is None:
            try:
                access_token = content['access']

                await self.disconnect(None)

                self.user = await sync_to_async(get_user_by_token)(access_token)
                self.room_group_name = 'chat_%s' % self.user.username.replace(' ', '')

                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )

                self.user.is_online = True
                await sync_to_async(self.user.save)()
            except KeyError:
                raise RequestAborted

    async def add_to_specific_chat_group(self, content):
        """Присоеденить/отсоединить в новую группу участников чата"""

        try:
            chat = await sync_to_async(Chat.objects.get)(id=content['chatId'])

            if self.chat is None or self.chat != chat:
                await self.disconnect(None)

                self.chat = chat
                self.room_group_name = 'chat_%s' % self.chat.id

                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )

                self.user.is_online = True
                await sync_to_async(self.user.save)()
        except Chat.DoesNotExist:
            # отсеодинить из группы участников чата

            await self.disconnect(None)

            self.chat = None
            self.room_group_name = 'chat_%s' % self.user.username

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        except KeyError:
            raise RequestAborted

    async def create_message_and_notify_users(self, content):
        """Создать сообщение"""

        try:
            message_text = content['messageText']
            message = await sync_to_async(Message.objects.create)(
                chat=self.chat, sent_from=self.user, text=message_text
            )
            serializer = await sync_to_async(MessageSerializer)(message)
            interlocutor = await sync_to_async(self.chat.get_interlocutor)(self.user)

            # уведомить участников чата
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notify_room',
                    'message': serializer.data
                }
            )

            # уведомить лично собеседника
            await self.channel_layer.group_send(
                'chat_%s' % interlocutor.username,
                {
                    'type': 'notify_room',
                    'message': serializer.data
                }
            )
        except KeyError:
            raise RequestAborted

    async def notify_room(self, event):
        event['message'] = humps.camelize(event['message'])
        event['status'] = 200
        await self.send_json(event)
