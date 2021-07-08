from django.urls import path
from .views import ChessAPIView


app_name = 'chess'

urlpatterns = [
    path('', ChessAPIView.as_view(), name='chess')
]
