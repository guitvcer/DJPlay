import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from account.models import Game
from account.services import update_queue

game = Game.objects.get(name='Шахматы')


class FindOpponentConsumer(WebsocketConsumer):
    """Consumer поиска соперника"""

    def connect(self):
        self.room_name = 'chess_party'
        self.room_group_name = 'find_%s' % self.room_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        token = data['message']
        new_party = update_queue(game, token)

        if new_party is not None:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'notify_room',
                    'message': new_party.id,
                    'white': new_party.white.username,
                    'black': new_party.black.username,
                }
            )

    def notify_room(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
            'white': event['white'],
            'black': event['black'],
        }))
