from django.urls import path

from chess.views import ChessPartyListAPIView
from gomoku.views import GomokuPartyListAPIView
from . import views


app_name = "account"

urlpatterns = [
    path("authorization", views.AuthorizationAPIView.as_view(), name="authorization"),
    path("registration", views.RegistrationAPIView.as_view(), name="registration"),
    path("change-password", views.UserChangePasswordAPIView.as_view(), name="change_password"),
    path("delete", views.UserDeleteAPIView.as_view(), name="delete_profile"),
    path("social-authorization", views.SocialAuthorizationAPIView.as_view(), name="social_authorization"),
    path("refresh-token", views.RefreshTokenAPIView.as_view(), name="refresh_token"),

    path("games/", views.GamesListAPIView.as_view(), name="games"),
    path("users/", views.UsersListAPIView.as_view(), name="users_list"),
    path("edit/", views.UserProfileEditAPIView.as_view(), name="edit_profile"),
    path("friends/", views.UsersListAPIView.as_view(), name="friends"),
    path("views/", views.UsersListAPIView.as_view(), name="views"),
    path("party-list/gomoku/", GomokuPartyListAPIView.as_view(), name="gomoku_party_list"),
    path("party-list/chess/", ChessPartyListAPIView.as_view(), name="chess_party_list"),

    path("<str:username>/party-list/gomoku/", GomokuPartyListAPIView.as_view(), name="users_gomoku_party_list"),
    path("<str:username>/party-list/chess/", ChessPartyListAPIView.as_view(), name="users_chess_party_list"),

    path("<str:username>/friend-request", views.UserFriendRequestAPIView.as_view(), name="friend_request"),
    path("<str:username>/friends/", views.UsersListAPIView.as_view(), name="users_friends"),
    path("<str:username>/views/", views.UsersListAPIView.as_view(), name="users_views"),
    path("<str:username>/", views.UserProfileAPIView.as_view(), name="profile"),

    path("", views.UserProfileAPIView.as_view(), name="me")
]
