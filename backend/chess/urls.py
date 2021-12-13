from django.urls import path
from .views import ChessAPIView, ChessPartyAPIView


urlpatterns = [
    path("<int:pk>/", ChessPartyAPIView.as_view(), name="chess_party"),
    path("", ChessAPIView.as_view(), name="chess"),
]
