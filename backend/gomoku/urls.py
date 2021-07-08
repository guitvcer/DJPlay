from django.urls import path
from .views import GomokuAPIView


app_name = 'gomoku'

urlpatterns = [
    path('', GomokuAPIView.as_view(), name='gomoku')
]
