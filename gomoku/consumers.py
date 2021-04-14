import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from account.services import get_user_by_token
from .services import update_queue_of_gomoku, register_move, create_message, get_last_move_of_player,\
    get_and_delete_moves_after_returnable_move


class FindOpponentConsumer(WebsocketConsumer):
    """Consumer поиска соперника"""

    # подключение пользователя в группы
    def connect(self):
        self.room_name = 'party'
        self.room_group_name = 'find_%s' % self.room_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    # отключение
    def disconnect(self, close_code):
        update_queue_of_gomoku(None)

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    # получение сообщений от участника группы
    def receive(self, text_data):
        text_data = json.loads(text_data)
        token = text_data['message']
        new_party = update_queue_of_gomoku(token)

        if new_party is not None:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'notify_room',
                    'message': new_party.id,
                    'player1': new_party.player1.username,
                    'player2': new_party.player2.username,
                }
            )

    # отправка сообщений участникам группы
    def notify_room(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
            'player1': event['player1'],
            'player2': event['player2'],
        }))


class GomokuPartyConsumer(WebsocketConsumer):
    """Consumer партии Гомоку"""

    # подключение
    def connect(self):
        self.room_name = 'party'
        self.room_group_name = 'gomoku_%s' % self.room_name
        self.user_token = self.scope['cookies']['access']

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    # отключение
    def disconnect(self, close_code):
        player = get_user_by_token(self.user_token)
        register_move('give_up', self.party_id, player)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_move',
                'username': player.username,
                'move': 'exit',
            }
        )

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    # получение сообщений
    def receive(self, text_data):
        text_data = json.loads(text_data)

        self.party_id = text_data['party_id']
        player = get_user_by_token(self.user_token)

        try:
            move = text_data['move']
            result = register_move(move, self.party_id, player)

            if type(result) == list:
                # игрок побеждает, его последний ход сделал непрерывную линию из 5 точек
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'send_move',
                        'username': player.username,
                        'move': move,
                        'win': True,
                        'row_moves': json.dumps(result),
                    }
                )
            else:
                # игрок еще не побеждает, так как его последний ход не делает линию
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'send_move',
                        'username': player.username,
                        'move': move,
                    }
                )
        except KeyError:
            pass

    # отправить сообщение
    def send_move(self, event):
        message = {'username': event['username'],
                   'move': event['move']}

        try:
            message['win'] = event['win']
            message['row_moves'] = event['row_moves']
        except KeyError:
            pass

        self.send(text_data=json.dumps(message))


class GomokuChatConsumer(WebsocketConsumer):
    """Consumer чата Гомоку"""

    # подключение
    def connect(self):
        self.room_name = 'chat'
        self.room_group_name = 'gomoku_%s' % self.room_name
        self.user_token = self.scope['cookies']['access']

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    # отключение
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    # получение сообщений
    def receive(self, text_data):
        text_data = json.loads(text_data)
        party_id = text_data['party_id']
        text = text_data['text']
        player = get_user_by_token(self.user_token)
        message = create_message(party_id, text, player)

        if message.text == '/return_move_accept':
            removable_moves = get_and_delete_moves_after_returnable_move(party_id, text_data['coordinate'])

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'username': message.player,
                    'text': message.text,
                    'removable_moves': removable_moves,
                }
            )
        elif message.text == '/return_move_decline':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'username': message.player,
                    'text': message.text,
                }
            )
        elif message.text == '/return_move':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'username': message.player,
                    'text': message.text,
                    'date': message.date,
                    'coordinate': text_data['coordinate'],
                }
            )
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'username': message.player,
                    'text': message.text,
                    'date': message.date,
                }
            )

    # отправить сообщение
    def send_message(self, event):
        message = {
            'username': event['username'].username,
            'text': event['text'],
        }

        try:
            message['coordinate'] = event['coordinate']
        except KeyError:
            pass

        try:
            message['removable_moves'] = event['removable_moves']
        except KeyError:
            pass

        self.send(text_data=json.dumps(message))
