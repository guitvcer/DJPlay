from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include


urlpatterns = [
    path("api/account/", include("account.urls", namespace="account")),
    path("api/chat/", include("chat.urls")),
    path("api/gomoku/", include("gomoku.urls")),
    path("api/chess/", include("chess.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
