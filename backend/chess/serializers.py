from rest_framework import serializers

from account.serializers import UserInfoSerializer
from .models import Party, Move


class ChessMoveSerializer(serializers.ModelSerializer):
    """Serializer хода партии Шахмат"""

    player = UserInfoSerializer()

    class Meta:
        model = Move
        fields = "__all__"


class ChessPartyListSerializer(serializers.ModelSerializer):
    """Serializer списка партии Шахмат"""

    white = UserInfoSerializer()
    black = UserInfoSerializer()
    result = serializers.CharField(source="get_result_display")
    moves_count = serializers.SerializerMethodField("get_moves_count")

    @staticmethod
    def get_moves_count(party: Party) -> int:
        return party.get_moves().count()

    class Meta:
        model = Party
        exclude = ("game", )


class ChessPartySerializer(serializers.ModelSerializer):
    """Serializer партии Шахмат"""

    white = UserInfoSerializer()
    black = UserInfoSerializer()
    result = serializers.CharField(source="get_result_display")
    moves = serializers.SerializerMethodField("get_moves")

    @staticmethod
    def get_moves(party: Party) -> dict:
        serializer = ChessMoveSerializer(party.get_moves(), many=True)
        return serializers.data

    class Meta:
        model = Party
        exclude = ("game", )
