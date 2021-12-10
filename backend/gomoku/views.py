from rest_framework.generics import RetrieveAPIView, ListAPIView

from account.models import Game
from account.paginations import PartyListPagination
from account.serializers import GameSerializer
from account.services import get_specific_or_current_users_party_list
from .models import Party
from .serializers import GomokuPartySerializer, GomokuPartyListSerializer


class GomokuAPIView(RetrieveAPIView):
    """Информация о Гомоку"""

    serializer_class = GameSerializer

    def get_object(self):
        return Game.objects.get(app_name="gomoku")


class GomokuPartyAPIView(RetrieveAPIView):
    """Информация об определенной партии Гомоку"""

    serializer_class = GomokuPartySerializer
    queryset = Party.objects.all()


class GomokuPartyListAPIView(ListAPIView):
    """Список сыгранных партии пользователя"""

    serializer_class = GomokuPartyListSerializer
    pagination_class = PartyListPagination

    def get_queryset(self):
        return get_specific_or_current_users_party_list(self.request.user,
                                                        self.kwargs.get("username"), "gomoku")
