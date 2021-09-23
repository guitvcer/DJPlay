# DJPlay

## Описание
[DJPlay](https://djplay.space/) - это веб-приложение с логическими играми в реальном времени написанный на Django и VueJS. Разрабатывалась в целях обучения.
## Список игр
* Гомоку (5 в ряд)
* Шахматы (в разработке)

___

## Запуск через Docker
    docker pull guitvcer/djplay_backend_image:local
    docker pull guitvcer/djplay_frontend_image:local
    docker run -d -p 8000:8000 --rm guitvcer/djplay_backend_image:local
    docker run -d -p 8080:8080 --rm guitvcer/djplay_frontend_image:local

## Запуск через docker-compose
    git clone https://github.com/guitvcer/DJPlay.git
    cd DJPlay
    docker-compose up

## Запуск сервера
    cd DJPlay/backend
    poetry install
    poetry shell
    python manage.py makemigrations account chat gomoku
    python manage.py migrate
    python manage.py setup
    python manage.py runserver

## Запуск клиента
    cd DJPlay/frontend
    npm i
    npm run serve