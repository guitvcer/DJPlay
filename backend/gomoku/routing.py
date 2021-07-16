from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path('gomoku/ws/chat', consumers.GomokuChatConsumer.as_asgi()),
    path('gomoku/ws/find', consumers.FindOpponentConsumer.as_asgi()),
    path('gomoku/ws/play/<int:id>', consumers.GomokuPartyConsumer.as_asgi()),
]
