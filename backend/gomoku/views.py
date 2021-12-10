from rest_framework.generics import RetrieveAPIView
from account.models import Game
from account.serializers import GameSerializer
from .models import Party
from .serializers import GomokuPartySerializer


class GomokuAPIView(RetrieveAPIView):
    """Информация о Гомоку"""

    serializer_class = GameSerializer

    def get_object(self):
        return Game.objects.get(app_name="gomoku")


class GomokuPartyAPIView(RetrieveAPIView):
    """Информация об определенной партии Гомоку"""

    serializer_class = GomokuPartySerializer
    queryset = Party.objects.all()
