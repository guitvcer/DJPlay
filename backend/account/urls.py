from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('users/', views.MainUsersListAPIView.as_view(), name='users_list'),
    path('authorization', views.AuthorizationAPIView.as_view(), name='authorization'),
    path('games/', views.GamesListAPIView.as_view(), name='games'),
    path('<str:username>/', views.MainUserProfileAPIView.as_view(), name='profile')
]
