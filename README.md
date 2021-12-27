# DJPlay

## Описание
[DJPlay](https://djplay.space/) - это веб-приложение с логическими играми в реальном времени написанный на Django и VueJS. Разрабатывалась в целях обучения.
## Список игр
* Гомоку (5 в ряд)
* Шахматы
* Шашки (в разработке)

___

## Запуск через docker-compose
    git clone https://github.com/guitvcer/DJPlay.git
    cd DJPlay
    docker-compose up

## Запуск сервера
    cd DJPlay/backend
    poetry install
    poetry shell
    python manage.py makemigrations account chat gomoku chess checkers
    python manage.py migrate
    python manage.py setup
    python manage.py runserver

## Запуск клиента
    cd DJPlay/frontend
    npm i
    npm run serve