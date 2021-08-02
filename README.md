# DJPlay

## Описание
[DJPlay](http://13.58.137.214/) - это веб-сайт с логическими играми в реальном времени написанный на Django. Разрабатывалась в целях обучения.
## Список игр
* Гомоку (5 в ряд)
* Шахматы (в разработке)

___

## Запуск сервера
    cd DJPlay/backend
    poetry install
    poetry shell
    python manage.py makemigrations account gomoku
    python manage.py migrate
    python manage.py setup
    python manage.py runserver


## Запуск клиента
    cd DJPlay/frontend
    npm i
    npm run serve