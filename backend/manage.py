import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    from django.core.management.commands.runserver import Command

    Command.default_addr = '192.168.1.6'
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
