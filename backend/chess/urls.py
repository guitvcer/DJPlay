from django.urls import path
from . import views


app_name = 'chess'

urlpatterns = [
    path('', views.PlayChessView.as_view(), name="play"),
]
