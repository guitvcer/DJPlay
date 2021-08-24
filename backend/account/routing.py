from django.urls import path

from .consumers import ConnectingConsumer


websocket_urlpatterns = [
    path('ws', ConnectingConsumer.as_asgi()),
]
