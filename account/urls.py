from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('chat/search', views.ChatSearchAPIView.as_view(), name='chat_search_api'),
    path('chat/api', views.ChatUsersAPIView.as_view(), name='chat_users_api'),
    path('chat/<int:user_id>/api', views.ChatUserAPIView.as_view(), name='chat_user_api'),
    path('chat/<int:id>/', views.ChatView.as_view(), name='chat_user'),
    path('chat/', views.ChatView.as_view(), name='chat'),

    path('registration/', views.RegistrationView.as_view(), name='registration'),
    path('authorization/', views.AuthorizationView.as_view(), name='authorization'),
    path('logout', views.LogoutView.as_view(), name='logout'),

    path('users/api', views.UserAPIView.as_view(), name='user_api'),
    path('users/', views.UsersView.as_view(), name='users'),

    path('edit/', views.EditProfileView.as_view(), name='edit_profile'),
    path('delete/', views.DeleteProfileView.as_view(), name='delete_profile'),
    path('change_password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('<str:username_of_request_to>/friend_request', views.FriendRequestView.as_view(), name='friend_request'),
    path('<str:username>/friends/', views.UsersFriendView.as_view(), name='users_friends'),
    path('<str:username>/gomoku_parties/', views.GomokuPartiesView.as_view(), name='gomoku_parties'),
    path('<str:username>/views/', views.UsersViewsView.as_view(), name='users_views'),
    path('<str:username>/', views.ProfileView.as_view(), name='users_profile'),
    path('', views.ProfileView.as_view(), name='profile'),
]
