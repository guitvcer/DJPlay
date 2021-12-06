from rest_framework import serializers
from account.models import User
from account.serializers import UserInfoSerializer
from .models import Party, Move


class GomokuMoveSerializer(serializers.ModelSerializer):
    """Serializer ходов Гомоку"""

    player = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = Move
        exclude = ('party',)


class GomokuPartySerializer(serializers.ModelSerializer):
    """Serializer партии Гомоку"""

    player_1 = UserInfoSerializer()
    player_2 = UserInfoSerializer()
    winner = serializers.SerializerMethodField('get_winner')
    moves = serializers.SerializerMethodField('get_moves')

    @staticmethod
    def get_winner(party: Party) -> (dict, None):
        if party.winner is not None:
            winner = User.objects.get(username=party.winner)
            serializer = UserInfoSerializer(winner)

            return serializer.data

    @staticmethod
    def get_moves(party: Party) -> dict:
        serializer = GomokuMoveSerializer(party.get_moves(), many=True)
        return serializer.data

    class Meta:
        model = Party
        fields = '__all__'


class GomokuPartyListSerializer(serializers.ModelSerializer):
    """Serializer списка партии Гомоку"""

    player_1 = UserInfoSerializer()
    player_2 = UserInfoSerializer()
    winner = serializers.SerializerMethodField('get_winner')
    moves_count = serializers.SerializerMethodField('get_moves_count')

    @staticmethod
    def get_winner(party: Party) -> (dict, None):
        return GomokuPartySerializer.get_winner(party)

    @staticmethod
    def get_moves_count(party: Party) -> int:
        return party.get_moves().count()

    class Meta:
        model = Party
        fields = '__all__'
