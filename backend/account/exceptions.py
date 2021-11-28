from rest_framework.exceptions import APIException


class Gone(APIException):
    status_code = 410
