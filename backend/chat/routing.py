from django.urls import path

from .consumers import ChatConsumer


websocket_urlpatterns = [
    path('chat/ws/<str:username>/', ChatConsumer.as_asgi()),
]
