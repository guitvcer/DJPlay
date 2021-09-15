import os
from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = '^bll0r6(epnd9il893d409-j7^j0#0^9)srjc$4h@msh3vd9gh'

DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://192.168.1.9:8080'
]
PROTOCOL = 'http'


INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',

    'channels',
    'corsheaders',
    'drf_recaptcha',
    'easy_thumbnails',
    'rest_framework',
    'rest_framework.authtoken',

    'account',
    'chat',
    'gomoku',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'


WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

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


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'Asia/Almaty'

USE_I18N = True

USE_L10N = True

USE_TZ = True


STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


AUTH_USER_MODEL = 'account.User'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
        'djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseFormParser',
        'djangorestframework_camel_case.parser.CamelCaseMultiPartParser',
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
}

DRF_RECAPTCHA_SECRET_KEY = os.getenv("DRF_RECAPTCHA_SECRET_KEY")

SOCIAL_AUTH_VK_OAUTH_KEY = os.getenv("SOCIAL_AUTH_VK_OAUTH_KEY")
SOCIAL_AUTH_VK_OAUTH_SECRET = os.getenv("SOCIAL_AUTH_VK_OAUTH_SECRET")
SOCIAL_AUTH_VK_OAUTH_SCOPE = ['email']

SOCIAL_AUTH_GOOGLE_OAUTH_KEY = os.getenv("SOCIAL_AUTH_GOOGLE_OAUTH_KEY")
SOCIAL_AUTH_GOOGLE_OAUTH_SECRET = os.getenv("SOCIAL_AUTH_GOOGLE_OAUTH_SECRET")

AUTHENTICATION_BACKENDS = {
    'social_core.backends.vk.VKOAuth2',
    'django.contrib.auth.backends.ModelBackend',
}
