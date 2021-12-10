from rest_framework.generics import RetrieveAPIView, ListAPIView

from account.models import Game
from account.paginations import PartyListPagination
from account.serializers import GameSerializer
from account.services import get_specific_or_current_users_party_list
from .serializers import ChessPartyListSerializer


class ChessAPIView(RetrieveAPIView):
    """Информация о Шахматах"""

    serializer_class = GameSerializer

    def get_object(self):
        return Game.objects.get(app_name="chess")


class ChessPartyListAPIView(ListAPIView):
    """Список сыгранных партии пользователя"""

    serializer_class = ChessPartyListSerializer
    pagination_class = PartyListPagination

    def get_queryset(self):
        return get_specific_or_current_users_party_list(self.request.user,
                                                        self.kwargs.get("username"), "chess")
