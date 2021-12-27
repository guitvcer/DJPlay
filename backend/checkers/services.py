from account.models import Game
from .models import Queue


def add_checkers_into_database() -> None:
    """Добавить Шашки в БД, если нету"""

    try:
        Game.objects.get(app_name="checkers")
        Queue.objects.first()
    except Game.DoesNotExist:
        Game.objects.create(
            name="Шашки",
            app_name="checkers",
            rules="Шашки — логическая настольная игра для двух игроков, заключающаяся в передвижении "
                  "определённым образом фишек-шашек по клеткам шашечной доски. Во время партии каждому "
                  "игроку принадлежат шашки одного цвета: чёрного или белого. Цель игры — взять все шашки "
                  "соперника или лишить их возможности хода.",
            image="/checkers/checkers-logo.png",
            is_released=False
        )
        Queue.objects.create()
    except Queue.DoesNotExist:
        Queue.objects.create()
