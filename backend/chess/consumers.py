from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import AuthenticationFailed, ParseError

from account.models import Game
from account.serializers import UserInfoSerializer
from account.services import get_user_by_token
from .models import Party
from .services import draw_party, player_gives_up, make_move, checkmate, cancel_move


class FindOpponentConsumer(AsyncJsonWebsocketConsumer):
    """Consumer поиска соперника"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.room_group_name = None
        self.queue = None

    async def connect(self):
        self.room_name = "chess"
        self.room_group_name = "find_opponent_%s" % self.room_name

        chess = await sync_to_async(Game.objects.get)(app_name="chess")
        self.queue = await sync_to_async(chess.chess_queue.first)()

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
                white_serializer = await sync_to_async(UserInfoSerializer)(new_party.white)
                black_serializer = await sync_to_async(UserInfoSerializer)(new_party.black)

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": 'notify_room',
                        "party_id": new_party.id,
                        "white": white_serializer.data,
                        "black": black_serializer.data,
                    }
                )
                await self.disconnect(1000)
        except KeyError:
            await self.send_json({
                'status': 400,
            })
        except AuthenticationFailed:
            await self.send_json({
                'status': 401,
            })
            await self.disconnect(4401)

    async def notify_room(self, event):
        await self.send_json(event)


class ChessPartyConsumer(AsyncJsonWebsocketConsumer):
    """Consumer партии Шахмат"""

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room = None
        self.party_id = None
        self.room_group_name = None
        self.player = None

    async def connect(self):
        self.room = "chess"
        self.party_id = self.scope["url_route"]["kwargs"]["id"]
        self.room_group_name = "chess_party_%s" % self.party_id

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        party = await sync_to_async(Party.objects.get)(id=self.party_id)

        if self.player is not None and not party.result:
            await sync_to_async(player_gives_up)(self.party_id, self.player)
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

    async def receive_json(self, content, **kwargs):
        try:
            await self.authorize(content)
            await self.make_move(content)
            await self.offer_draw(content)
            await self.checkmate_or_stalemate(content)
            await self.cancel_move(content)
            await self.give_up(content)
        except AuthenticationFailed:
            await self.send_json({
                "status": 401,
            })
            await self.disconnect(4401)
        except (KeyError, ParseError):
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
            await sync_to_async(make_move)(
                self.party_id, content["notation"], content["time"], self.player
            )

            serializer = await sync_to_async(UserInfoSerializer)(self.player)

            await self.channel_layer.group_send(
                self.room_group_name, {
                    "type": "send_data",
                    "player": serializer.data,
                    "action": "make_move",
                    "notation": content["notation"],
                }
            )

    async def offer_draw(self, content: dict) -> None:
        """Предложить ничью"""

        if content["action"] == "offer_draw":
            serializer = await sync_to_async(UserInfoSerializer)(self.player)

            event = {
                "type": "send_data",
                "player": serializer.data,
                "action": "offer_draw",
            }

            if await sync_to_async(content.get)("request"):
                event["request"] = True
            elif await sync_to_async(content.get)("accept"):
                await sync_to_async(draw_party)(self.party_id)
                event["accept"] = True
            elif await sync_to_async(content.get)("decline"):
                event["decline"] = True
            else:
                raise ParseError

            await self.channel_layer.group_send(
                self.room_group_name, event
            )

    async def checkmate_or_stalemate(self, content: dict) -> None:
        """Закончить партию, если мат либо пат"""

        if content["action"] in ["checkmate", "stalemate"]:
            if content["action"] == "checkmate":
                await sync_to_async(checkmate)(self.party_id, self.player)
            elif content["action"] == "stalemate":
                await sync_to_async(draw_party)(self.party_id)

            serializer = await sync_to_async(UserInfoSerializer)(self.player)

            await self.channel_layer.group_send(
                self.room_group_name, {
                    "type": "send_data",
                    "action": content["action"],
                    "player": serializer.data,
                }
            )

    async def cancel_move(self, content: dict) -> None:
        """Отменить ход"""

        if content["action"] == "cancel_move":
            serializer = await sync_to_async(UserInfoSerializer)(self.player)
            event = {
                "type": "send_data",
                "action": "cancel_move",
                "player": serializer.data,
            }

            if await sync_to_async(content.get)("request"):
                event["request"] = True
                event["notation"] = content["notation"]
            elif await sync_to_async(content.get)("accept"):
                if await sync_to_async(cancel_move)(self.party_id, content["notation"]):
                    event["accept"] = True
                else:
                    return
            elif await sync_to_async(content.get)("decline"):
                event["decline"] = True

            await self.channel_layer.group_send(
                self.room_group_name, event
            )

    async def give_up(self, content: dict) -> None:
        """Сдаться"""

        if content["action"] == "give_up":
            await sync_to_async(player_gives_up)(self.party_id, self.player)
            serializer = await sync_to_async(UserInfoSerializer)(self.player)
            await self.channel_layer.group_send(
                self.room_group_name, {
                    "type": "send_data",
                    "action": "give_up",
                    "player": serializer.data,
                }
            )

    async def send_data(self, event: dict) -> None:
        await self.send_json(event)
