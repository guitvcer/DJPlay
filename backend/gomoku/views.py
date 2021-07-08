from rest_framework.generics import RetrieveAPIView
from account.models import Game
from account.serializers import GameSerializer


class GomokuAPIView(RetrieveAPIView):
    """Информация о Гомоку"""

    serializer_class = GameSerializer

    def get_object(self):
        return Game.objects.get(app_name='gomoku')
