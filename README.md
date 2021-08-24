# DJPlay

## Описание
[DJPlay](https://djplay.space/) - это веб-сайт с логическими играми в реальном времени написанный на Django. Разрабатывалась в целях обучения.
## Список игр
* Гомоку (5 в ряд)
* Шахматы (в разработке)

___

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