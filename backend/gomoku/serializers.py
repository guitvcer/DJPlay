from rest_framework import serializers
from .models import Party, Move


class GomokuMoveSerializer(serializers.ModelSerializer):
    """Serializer ходов Гомоку"""

    player = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = Move
        exclude = ('party', )


class GomokuPartySerializer(serializers.ModelSerializer):
    """Serializer ходов партии Гомоку"""

    player_1 = serializers.SlugRelatedField(read_only=True, slug_field='username')
    player_2 = serializers.SlugRelatedField(read_only=True, slug_field='username')
    moves = serializers.SerializerMethodField('get_moves')

    @staticmethod
    def get_moves(party: Party) -> dict:
        serializer = GomokuMoveSerializer(party.get_moves(), many=True)
        return serializer.data

    class Meta:
        model = Party
        fields = '__all__'


class GomokuPartyListSerializer(serializers.ModelSerializer):
    """Serializer партии Гомоку"""

    player_1 = serializers.SlugRelatedField(read_only=True, slug_field='username')
    player_2 = serializers.SlugRelatedField(read_only=True, slug_field='username')
    moves_count = serializers.SerializerMethodField('get_moves_count')

    @staticmethod
    def get_moves_count(party: Party) -> int:
        return party.get_moves().count()

    class Meta:
        model = Party
        fields = '__all__'
