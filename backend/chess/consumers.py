from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import AuthenticationFailed

from account.models import Game
from account.serializers import UserInfoSerializer
from account.services import get_user_by_token


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
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content, **kwargs):
        try:
            await self.authorize(content)
        except AuthenticationFailed:
            await self.send_json({
                "status": 401,
            })
            await self.disconnect(4401)

    async def authorize(self, content):
        """Авторизоваться"""

        if self.player is None and content["action"] == "authorize":
            access = content["access"]
            self.player = await sync_to_async(get_user_by_token)(access)