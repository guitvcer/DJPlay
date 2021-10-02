from .base import *


SECRET_KEY = '^bll0r6(epnd9il893d409-j7^j0#0^9)srjc$4h@msh3vd9gh'

DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '192.168.1.9']

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://192.168.1.9:8080'
]
PROTOCOL = 'http'


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


DRF_RECAPTCHA_SECRET_KEY = '6LdAUyUcAAAAANk8c-ooW4GBBcZF0lXN3ojPIDXx'
SOCIAL_AUTH_VK_OAUTH_SECRET = 'CQ3sIwLTPPax9hr0BNtO'
SOCIAL_AUTH_GOOGLE_OAUTH_SECRET = 'tqDq0wOfvrK4YZ7tzIpSyozy'
