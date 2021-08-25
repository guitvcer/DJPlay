from account.models import User
from .models import Chat


def get_chat(current_user: User, interlocutor: User) -> Chat:
    """Получить чат по имени пользователя собеседеника"""

    try:
        chat = Chat.objects.get(user1=current_user, user2=interlocutor)
    except Chat.DoesNotExist:
        try:
            chat = Chat.objects.get(user1=interlocutor, user2=current_user)
        except Chat.DoesNotExist:
            chat = Chat.objects.create(user1=interlocutor, user2=current_user)

    return chat
