from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include


urlpatterns = [
    path('account/', include('account.urls', namespace='account')),
    path('chat/', include('chat.urls')),
    path('gomoku/', include('gomoku.urls')),
    path('api/', include('rest_framework.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
