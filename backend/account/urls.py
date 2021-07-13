from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('authorization', views.AuthorizationAPIView.as_view(), name='authorization'),
    path('registration', views.RegistrationAPIView.as_view(), name='registration'),
    path('games/', views.GamesListAPIView.as_view(), name='games'),
    path('users/', views.UsersListAPIView.as_view(), name='users_list'),
    path('edit/', views.UserProfileEditAPIView.as_view(), name='edit_profile'),
    path('change-password/', views.UserChangePasswordAPIView.as_view(), name='change_password'),
    path('<str:username>/friends/', views.UsersListAPIView.as_view(), name='users_friends'),
    path('<str:username>/views/', views.UsersListAPIView.as_view(), name='users_views'),
    path('<str:username>/', views.UserProfileAPIView.as_view(), name='profile'),
    path('', views.UserProfileAPIView.as_view(), name='me')
]
