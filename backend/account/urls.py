from django.urls import path

from . import views


app_name = 'account'

urlpatterns = [
    path('users/', views.MainUsersListAPIView.as_view(), name='users_list'),
    path('<str:username>/', views.MainUserProfileAPIView.as_view(), name='profile'),
]
