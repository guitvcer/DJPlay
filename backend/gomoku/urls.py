from django.urls import path
from .views import GomokuAPIView, GomokuPartyAPIView


app_name = "gomoku"

urlpatterns = [
    path("<int:pk>/", GomokuPartyAPIView.as_view(), name="gomoku_party"),
    path("", GomokuAPIView.as_view(), name="gomoku")
]
