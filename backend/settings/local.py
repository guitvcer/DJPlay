from .base import *


SECRET_KEY = "^bll0r6(epnd9il893d409-j7^j0#0^9)srjc$4h@msh3vd9gh"

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost", os.getenv("BASE_URL")]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    os.getenv("VUE_APP_BASE_URL"),
]
PROTOCOL = "http"


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
