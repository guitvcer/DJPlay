from django.urls import path
from .views import CheckersAPIView


urlpatterns = [
    path("",  CheckersAPIView.as_view(), name="checkers"),
]
