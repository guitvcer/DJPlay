from .base import *


SECRET_KEY = os.getenv('SECRET_KEY')

DEBUG = False

ALLOWED_HOSTS = [os.getenv('HOST'), 'localhost', '127.0.0.1']
PROTOCOL = os.getenv('PROTOCOL')
CORS_ALLOWED_ORIGINS = [f'{PROTOCOL}://{ALLOWED_HOSTS[0]}']


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [
                (os.getenv('REDIS_SERVER_NAME'), os.getenv('REDIS_SERVER_PORT')),
            ]
        }
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


DRF_RECAPTCHA_SECRET_KEY = os.getenv('DRF_RECAPTCHA_SECRET_KEY')
SOCIAL_AUTH_VK_OAUTH_SECRET = os.getenv('SOCIAL_AUTH_VK_OAUTH_SECRET')
SOCIAL_AUTH_GOOGLE_OAUTH_SECRET = os.getenv('SOCIAL_AUTH_GOOGLE_OAUTH_SECRET')
