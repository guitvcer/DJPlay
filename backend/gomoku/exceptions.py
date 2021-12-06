from rest_framework.exceptions import APIException


class NotValidCoordinate(APIException):
    """Неправильная координата"""

    status_code = 400
