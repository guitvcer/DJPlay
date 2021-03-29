from django.urls import re_path

from . import consumers


websocket_urlpatterns = [
    re_path(r'ws/find$', consumers.FindOpponentConsumer.as_asgi()),
    re_path(r'ws/play$', consumers.GomokuPartyConsumer.as_asgi()),
]
