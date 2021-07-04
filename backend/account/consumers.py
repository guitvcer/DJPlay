import datetime
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from account.services import get_user_by_token, create_message


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
