from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('registration/', views.registration, name='registration'),
    path('authorization/', views.authorization, name='authorization'),
    path('logout', views.logout, name='logout'),
    path('users/', views.users, name='users'),
    path('edit/', views.edit_profile, name='edit_profile'),
    path('delete/', views.delete_profile, name='delete_profile'),
    path('change_password/', views.change_password, name='change_password'),
    path('<str:username_of_request_to>/friend_request', views.friend_request, name='friend_request'),
    path('<str:username>/friends/', views.users_friends, name='users_friends'),
    path('<str:username>/gomoku_parties/', views.gomoku_parties, name='gomoku_parties'),
    path('<str:username>/views/', views.users_views, name='users_views'),
    path('<str:username>/', views.profile, name='users_profile'),
    path('', views.profile, name='profile'),
]
