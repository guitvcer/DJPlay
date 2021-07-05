from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('chat/search', views.ChatSearchAPIView.as_view(), name='chat_search_api'),
    path('chat/api', views.ChatUsersAPIView.as_view(), name='chat_users_api'),
    path('chat/<int:user_id>/api', views.ChatUserAPIView.as_view(), name='chat_user_api'),
    path('users/api', views.UserAPIView.as_view(), name='user_api'),
]
