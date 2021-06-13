import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import account.routing
import chess.routing
import gomoku.routing


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "DJPlay.settings")

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": AuthMiddlewareStack(
        URLRouter(
            account.routing.websocket_urlpatterns +
            gomoku.routing.websocket_urlpatterns +
            chess.routing.websocket_urlpatterns
        )
    ),
})
