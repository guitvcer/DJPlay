from django.urls import path
from . import views


urlpatterns = [
    path("<str:username>/", views.ChatAPIView.as_view(), name="chat"),
    path("", views.ChatListAPIView.as_view(), name="chats"),
]
