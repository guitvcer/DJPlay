from django.urls import path

from chess import consumers


websocket_urlpatterns = [
    path('chess/ws/find', consumers.FindOpponentConsumer.as_asgi()),
]
