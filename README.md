# DJPlay

## Описание
[DJPlay](http://13.58.137.214/) - это веб-сайт с логическими играми в реальном времени написанный на Django. Разрабатывалась в целях обучения.
## Список игр
* Гомоку (5 в ряд)
* Шахматы (в разработке)

___

## Запуск на локальном сервере
    git clone https://github.com/guitvcer/DJPlay.git
    cd DJPlay
    pip install -r requirements.txt
    python manage.py makemigrations account gomoku chess
    python manage.py migrate
    python manage.py setup
    python manage.py runserver