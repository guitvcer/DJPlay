FROM python:3.9.7-bullseye

WORKDIR /app/backend

COPY poetry.lock .
COPY pyproject.toml .

RUN pip install -U pip
RUN pip install poetry
RUN poetry install

COPY . .

RUN poetry run python3 manage.py makemigrations account gomoku chat

EXPOSE 8001

CMD ["sleep", "10"]
CMD ["poetry", "run", "python3", "manage.py", "migrate"]
CMD ["poetry", "run", "python3", "manage.py", "setup"]
CMD ["poetry", "run", "gunicorn", "-w", "3", "-b", "0.0.0.0:8001", "core.wsgi:application"]
CMD ["poetry", "run", "daphne", "-p", "8001", "-b", "0.0.0.0", "core.asgi:application"]
