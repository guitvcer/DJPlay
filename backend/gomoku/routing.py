from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path("api/gomoku/ws/find", consumers.FindOpponentConsumer.as_asgi()),
    path("api/gomoku/ws/play/<int:id>", consumers.GomokuPartyConsumer.as_asgi()),
]
