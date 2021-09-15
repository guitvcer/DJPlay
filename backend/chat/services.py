from account.models import User
from .models import Chat


def get_or_create_chat(current_user: User, interlocutor: User) -> Chat:
    """Получить чат по имени пользователя собеседеника"""

    try:
        chat = Chat.objects.get(user_1=current_user, user_2=interlocutor)
    except Chat.DoesNotExist:
        try:
            chat = Chat.objects.get(user_1=interlocutor, user_2=current_user)
        except Chat.DoesNotExist:
            chat = Chat.objects.create(user_1=interlocutor, user_2=current_user)

    return chat
