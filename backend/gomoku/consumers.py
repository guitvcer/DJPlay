import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import AuthenticationFailed, ParseError

from account.models import User, Game
from account.serializers import UserInfoSerializer
from account.services import get_user_by_token
from .exceptions import NotValidCoordinate
from .models import Party, Queue
from .services import register_move, cancel_move, player_gives_up


class FindOpponentConsumer(AsyncJsonWebsocketConsumer):
    """Consumer поиска соперника"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.room_group_name = None
        self.queue = None

    async def connect(self):
        self.room_name = "party"
        self.room_group_name = "find_%s" % self.room_name

        gomoku = await sync_to_async(Game.objects.get)(name="Гомоку")
        self.queue = await sync_to_async(Queue.objects.get)(game=gomoku)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await sync_to_async(self.queue.update_queue)(clear=True)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content, **kwargs):
        try:
            token = content["access"]
            player = await sync_to_async(get_user_by_token)(token)
            new_party = await sync_to_async(self.queue.update_queue)(player)

            if new_party:
                player_1_serializer = await sync_to_async(UserInfoSerializer)(new_party.player_1)
                player_2_serializer = await sync_to_async(UserInfoSerializer)(new_party.player_2)

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "notify_room",
                        "party_id": new_party.id,
                        "player_1": player_1_serializer.data,
                        "player_2": player_2_serializer.data,
                    }
                )
        except KeyError:
            await self.send_json({
                "status": 400,
            })
        except AuthenticationFailed:
            await self.send_json({
                "status": 401,
            })

    async def notify_room(self, event):
        await self.send_json(event)


class GomokuPartyConsumer(AsyncJsonWebsocketConsumer):
    """Consumer партии Гомоку"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room = None
        self.party_id = None
        self.room_group_name = None
        self.player = None

    async def connect(self):
        self.room = "party"
        self.party_id = self.scope["url_route"]["kwargs"]["id"]
        self.room_group_name = "gomoku_%s" % self.party_id

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        await sync_to_async(player_gives_up)(self.party_id, self.player)

        if self.player is not None:
            serializer = await sync_to_async(UserInfoSerializer)(self.player)
            event = {
                "type": "send_data",
                "player": serializer.data,
                "action": "exit",
            }

            await self.channel_layer.group_send(
                self.room_group_name, event
            )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content: dict, **kwargs) -> None:
        try:
            await self.authorize(content)
            await self.make_move(content)
            await self.cancel_move(content)
        except AuthenticationFailed:
            await self.send_json({
                "status": 401
            })
        except (KeyError, ParseError, NotValidCoordinate):
            await self.send_json({
                "status": 400,
            })

    async def authorize(self, content: dict) -> None:
        """Авторизоваться"""

        if self.player is None and content["action"] == "authorize":
            access = content["access"]
            self.player = await sync_to_async(get_user_by_token)(access)

    async def make_move(self, content: dict) -> None:
        """Сделать ход"""

        if content["action"] == "make_move":
            coordinate = content["coordinate"]
            row = await sync_to_async(register_move)(coordinate, self.party_id, self.player)
            serializer = await sync_to_async(UserInfoSerializer)(self.player)

            event = {
                "type": "send_data",
                "player": serializer.data,
                "coordinate": coordinate,
                "action": "make_move",
                "row_moves": json.dumps if row else None
            }

            await self.channel_layer.group_send(
                self.room_group_name, event
            )

    async def cancel_move(self, content: dict) -> None:
        """Отмена хода"""

        if content["action"] == "cancel_move":
            serializer = await sync_to_async(UserInfoSerializer)(self.player)

            event = {
                "type": "send_data",
                "player": serializer.data,
                "action": "cancel_move",
            }

            if await sync_to_async(content.get)("request"):
                event["request"] = True
            elif await sync_to_async(content.get)("accept"):
                coordinate = await sync_to_async(self.get_and_cancel_opponents_move)()
                event["coordinate"] = coordinate
                event["accept"] = True
            elif await sync_to_async(content.get)("decline"):
                event["decline"] = True
            else:
                raise ParseError

            await self.channel_layer.group_send(
                self.room_group_name, event
            )

    def get_and_cancel_opponents_move(self) -> str:
        """Получить и отменить ход соперника"""

        party = Party.objects.get(id=self.party_id)
        party_moves = party.get_moves()

        if party.player_1.id == self.player.id:
            canceling_id = party.player_2.id
        else:
            canceling_id = party.player_1.id

        canceling = User.objects.get(id=canceling_id)
        moves = party_moves.filter(player=canceling)
        move = moves.last()
        coordinate = move.coordinate
        cancel_move(self.party_id, coordinate)

        return coordinate

    async def send_data(self, event: dict) -> None:
        await self.send_json(event)
