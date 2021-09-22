FROM python:3.9.7-bullseye

WORKDIR /app/backend

COPY poetry.lock .
COPY pyproject.toml .

RUN pip install -U pip
RUN pip install poetry
RUN poetry install

COPY . .

EXPOSE 8001