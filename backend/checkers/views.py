from rest_framework.generics import RetrieveAPIView
from account.models import Game
from account.serializers import GameSerializer


class CheckersAPIView(RetrieveAPIView):
    """Информация о Шашках"""

    serializer_class = GameSerializer

    def get_object(self):
        return Game.objects.get(app_name="checkers")
