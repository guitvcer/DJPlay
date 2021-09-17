from .base import *


DEBUG = False

ALLOWED_HOSTS = [os.getenv('BACKEND_HOST'), '127.0.0.1', 'localhost']

CORS_ALLOWED_ORIGINS = [os.getenv('FRONTEND_HOST')]

PROTOCOL = os.getenv('PROTOCOL')


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT')
    }
}
