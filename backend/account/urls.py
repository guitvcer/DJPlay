from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('authorization', views.AuthorizationAPIView.as_view(), name='authorization'),
    path('games/', views.GamesListAPIView.as_view(), name='games'),
    path('users/', views.MainUsersListAPIView.as_view(), name='users_list'),
    path('<str:username>/friends/', views.MainUsersListAPIView.as_view(), name='users_friends'),
    path('<str:username>/views/', views.MainUsersListAPIView.as_view(), name='users_views'),
    path('<str:username>/', views.MainUserProfileAPIView.as_view(), name='profile'),
    path('', views.CurrentMainUserInfoAPIView.as_view(), name='me')
]
