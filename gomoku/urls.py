from django.urls import path

from . import views


app_name = 'gomoku'

urlpatterns = [
    path('<int:id>/', views.watch_party, name='watch_party'),
    path('', views.play_gomoku, name='play'),
]
