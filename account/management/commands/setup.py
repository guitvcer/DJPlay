from django.core.management.base import BaseCommand
from django.db.utils import OperationalError
from account.models import Game, Queue


class Command(BaseCommand):
    """Кастомная команда для настройки БД"""

    help = "Setting up database"

    def handle(self, *args, **options):
        try:
            try:
                gomoku = Game.objects.get(name="Гомоку")
                Queue.objects.get(game=gomoku)
            except Game.DoesNotExist:
                gomoku = Game.objects.create(
                    name="Гомоку",
                    app_name="gomoku",
                    rules="Гомоку — настольная логическая игра для двух игроков."
                          " На квадратной доске размером 15×15 пунктов игроки поочерёдно выставляют камни двух цветов."
                          " Выигрывает тот, кто первым построит непрерывный ряд из пяти камней своего цвета по"
                          " вертикали, горизонтали или диагонали.",
                    image="/gomoku.png",
                    is_released=True
                )
                Queue.objects.create(game=gomoku)
            except Queue.DoesNotExist:
                Queue.objects.create(game=gomoku)

            try:
                chess = Game.objects.get(name='Шахматы')
                Queue.objects.get(game=chess)
            except Game.DoesNotExist:
                chess = Game.objects.create(
                    name="Шахматы",
                    app_name="chess",
                    rules="Шахматная партия ведётся между двумя соперниками на шахматной доске путём передвижения"
                          " шахматных фигур. Соперником в шахматной партии может быть один человек, коллектив из"
                          " нескольких человек или компьютер.<ul><li>Партия считается выигранной шахматистом,"
                          " который дал мат королю соперника.</li><li>Партия считается выигранной тем из партнёров,"
                          " противник которого признал себя побеждённым.</li><li>Партия считается выигранной, если у"
                          " одного из шахматистов закончилось время на ходы.</li></ul>",
                    image="/chess.png",
                    is_released=False
                )
                Queue.objects.create(game=chess)
            except Queue.DoesNotExist:
                Queue.objects.create(game=chess)

            self.stdout.write(self.style.SUCCESS('Database was successfully set up'))
        except OperationalError:
            self.stdout.write(self.style.ERROR('Apply migrations by "python manage.py migrate"'))
