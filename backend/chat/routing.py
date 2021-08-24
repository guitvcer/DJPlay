from django.urls import path

from .consumers import ChatConsumer


websocket_urlpatterns = [
    path('chat/ws/<str:username>/<str:access_token>/', ChatConsumer.as_asgi()),
]
