from rest_framework.generics import RetrieveAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView
from account.models import Game
from account.serializers import GameSerializer
from .models import Party
from .serializers import GomokuPartySerializer


class GomokuAPIView(RetrieveAPIView):
    """Информация о Гомоку"""

    serializer_class = GameSerializer

    def get_object(self):
        return Game.objects.get(app_name='gomoku')


class GomokuPartyAPIView(APIView):
    """Информация об определенной партии Гомоку"""

    @staticmethod
    def get(request, *args, **kwargs):
        party = get_object_or_404(Party.objects.all(), id=kwargs.get('id'))
        serializer = GomokuPartySerializer(party)

        return Response(serializer.data, status=HTTP_200_OK)
