from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path('gomoku/ws/chat', consumers.GomokuChatConsumer.as_asgi()),
    path('gomoku/ws/find', consumers.FindOpponentConsumer.as_asgi()),
    path('gomoku/ws/play', consumers.GomokuPartyConsumer.as_asgi()),
]
