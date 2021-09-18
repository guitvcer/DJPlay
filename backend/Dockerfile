FROM python:3.9.7-bullseye

WORKDIR /app

COPY . .

RUN pip install poetry
RUN poetry install
RUN poetry run python3 manage.py makemigrations account gomoku chat
RUN poetry run python3 manage.py migrate
RUN poetry run python3 manage.py setup

EXPOSE 8000

CMD ["poetry", "run", "python3", "manage.py", "runserver", "0.0.0.0:8000"]
