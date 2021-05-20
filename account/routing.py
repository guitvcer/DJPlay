from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path('ws', consumers.ConnectingConsumer.as_asgi()),
    path('ws/chat', consumers.ChatConsumer.as_asgi()),
]
