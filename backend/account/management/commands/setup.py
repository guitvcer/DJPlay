from django.core.management.base import BaseCommand
from django.db.utils import OperationalError
from gomoku.services import add_gomoku_into_database


class Command(BaseCommand):
    """Кастомная команда для настройки БД"""

    help = "Setting up database"

    def handle(self, *args, **options):
        try:
            add_gomoku_into_database()
            self.stdout.write(self.style.SUCCESS('Database was successfully set up'))
        except OperationalError:
            self.stdout.write(self.style.ERROR('Apply migrations by "python manage.py migrate"'))
