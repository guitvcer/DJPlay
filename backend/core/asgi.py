from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

import chat.routing
import gomoku.routing

application = ProtocolTypeRouter({
  "http": django_asgi_app,
  "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns +
            gomoku.routing.websocket_urlpatterns
        )
    ),
})
