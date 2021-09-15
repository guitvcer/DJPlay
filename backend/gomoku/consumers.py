import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from account.models import Game, Queue
from account.services import get_user_by_token
from .services import register_move, delete_returnable_move

game = Game.objects.get(name='Гомоку')
queue = Queue.objects.get(game=game)


class FindOpponentConsumer(AsyncJsonWebsocketConsumer):
    """Consumer поиска соперника"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        self.room_name = 'party'
        self.room_group_name = 'find_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await sync_to_async(Queue.update_queue)(queue, None)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content, **kwargs):
        token = content.get('access_token')
        player = await sync_to_async(get_user_by_token)(token)
        new_party = await sync_to_async(Queue.update_queue)(queue, player)

        if new_party:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notify_room',
                    'party_id': new_party.id,
                    'player_1': new_party.player_1.username,
                    'player_2': new_party.player_2.username,
                }
            )

    async def notify_room(self, event):
        await self.send_json({
            'party_id': event['party_id'],
            'player_1': event['player_1'],
            'player_2': event['player_2'],
        })


class GomokuPartyConsumer(AsyncJsonWebsocketConsumer):
    """Consumer партии Гомоку"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room = None
        self.party_id = None
        self.room_group_name = None
        self.player = None

    async def connect(self):
        self.room = 'party'
        self.party_id = self.scope['url_route']['kwargs']['id']
        self.room_group_name = 'gomoku_%s' % self.party_id

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await sync_to_async(register_move)('give_up', self.party_id, self.player)

        if self.player is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_move',
                    'username': self.player.username,
                    'move': 'exit',
                }
            )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content, **kwargs):
        if self.player is None:
            access_token = await sync_to_async(content.get)('access_token')
            self.player = await sync_to_async(get_user_by_token)(access_token)

        move = content.get('move')

        if move is None:
            return

        result = await sync_to_async(register_move)(move, self.party_id, self.player)

        if type(result) == list:
            # игрок побеждает, его последний ход сделал непрерывную линию из 5 точек
            event = {
                'type': 'send_move',
                'username': self.player.username,
                'move': move,
                'win': True,
                'row_moves': json.dumps(result),
            }
        else:
            # игрок еще не побеждает, так как его последний ход не делает линию
            event = {
                'type': 'send_move',
                'username': self.player.username,
                'move': move,
            }

        await self.channel_layer.group_send(
            self.room_group_name,
            event
        )

    async def send_move(self, event):
        message = {
            'username': event['username'],
            'move': event['move']
        }

        try:
            message['win'] = event['win']
            message['row_moves'] = event['row_moves']
        except KeyError:
            pass

        await self.send_json(message)


class ReturnMoveConsumer(AsyncJsonWebsocketConsumer):
    """Consumer отмены хода партии Гомоку"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = 'chat'
        self.room_group_name = None
        self.player = None
        self.party_id = None

    async def connect(self):
        self.party_id = self.scope['url_route']['kwargs']['id']
        self.room_group_name = 'gomoku_chat_%s' % self.party_id

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content, **kwargs):
        if self.player is None:
            self.player = await sync_to_async(get_user_by_token)(content.get('access_token'))

        command = content.get('command')

        if command == 'return_move_accept':
            await sync_to_async(delete_returnable_move)(self.party_id, content.get('returnable_move'))

            event = {
                'type': 'send_message',
                'returner': content.get('returner'),
                'command': command,
                'returnable_move': content['returnable_move'],
            }
        elif command == 'return_move_decline':
            event = {
                'type': 'send_message',
                'returner': content['returner'],
                'command': command,
            }
        elif command == 'return_move':
            event = {
                'type': 'send_message',
                'returner': content['returner'],
                'command': command,
                'returnable_move': content['returnable_move'],
            }
        else:
            return

        await self.channel_layer.group_send(
            self.room_group_name, event
        )

    async def send_message(self, event):
        message = {
            'returner': event['returner'],
            'command': event['command'],
        }

        returnable_move = event.get('returnable_move')
        if returnable_move is not None:
            message['returnable_move'] = returnable_move

        returnable_moves = event.get('returnable_moves')
        if returnable_moves is not None:
            message['returnable_moves'] = returnable_moves

        await self.send_json(message)
