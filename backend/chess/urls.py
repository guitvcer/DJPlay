from django.urls import path
from .views import ChessAPIView


urlpatterns = [
    path('', ChessAPIView.as_view(), name='chess')
]
