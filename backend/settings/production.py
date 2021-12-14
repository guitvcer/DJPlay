from .base import *


SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = [os.getenv("HOST"), f"www.{os.getenv('BASE_URL')}", "localhost", "127.0.0.1"]
CORS_ALLOWED_ORIGINS = [f"{'VUE_APP_BASE_URL'}"]


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                (os.getenv("REDIS_SERVER_NAME"), os.getenv("REDIS_SERVER_PORT")),
            ]
        }
    },
}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT")
    }
}
