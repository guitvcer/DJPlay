from rest_framework import serializers

from account.serializers import UserInfoSerializer
from .models import Party, Move


class ChessMoveSerializer(serializers.ModelSerializer):
    """Serializer хода партии Шахмат"""

    player = UserInfoSerializer()
    time = serializers.SerializerMethodField("get_time_in_seconds")

    @staticmethod
    def get_time_in_seconds(move: Move):
        hours, minutes, seconds = str(move.time).split(":")
        return int(hours) * 3600 + int(minutes) * 60 + int(seconds)

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
        moves_count = party.get_moves().count()

        if moves_count % 2 == 1:
            moves_count -= 1

        return moves_count / 2

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
        return serializer.data

    class Meta:
        model = Party
        exclude = ("game", )
