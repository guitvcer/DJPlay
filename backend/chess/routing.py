from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path("api/chess/ws/find", consumers.FindOpponentConsumer.as_asgi()),
    path("api/chess/ws/play/<int:id>", consumers.ChessPartyConsumer.as_asgi()),
]
