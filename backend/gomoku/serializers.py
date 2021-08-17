from rest_framework import serializers
from .models import Party, Move


class GomokuPartySerializer(serializers.ModelSerializer):
    """Serializer партии Гомоку"""

    player1 = serializers.SlugRelatedField(read_only=True, slug_field='username')
    player2 = serializers.SlugRelatedField(read_only=True, slug_field='username')
    moves = serializers.SerializerMethodField('get_moves')

    def get_moves(self, party):
        return party.get_moves().count()

    class Meta:
        model = Party
        fields = '__all__'


class GomokuPartyMoveSerializer(serializers.ModelSerializer):
    """Serializer ходов партии Гомоку"""

    class Meta:
        model = Move
        fields = '__all__'
