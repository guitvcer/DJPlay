from django.urls import path

from . import views


app_name = 'gomoku'

urlpatterns = [
    path('<int:id>/', views.WatchPartyView.as_view(), name='watch_party'),
    path('', views.PlayGomokuView.as_view(), name='play'),
]
