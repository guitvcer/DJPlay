from pydantic import BaseModel, Field


class MainUserSchema(BaseModel):
    """JSON схема для модели пользователя"""

    username: str
    first_name: str or None = Field(alias='firstName')
    last_name: str or None = Field(alias='lastName')
    email: str
    avatar: str
    birthday: str or None
    gender: str or None
    views: int
    friends: int
    date_joined: str = Field(alias='dateJoined')
    last_online: str or None = Field(alias='lastOnline')
    is_online: bool = Field(alias='isOnline')
    is_active: bool = Field(alias='isActive')
    is_private: bool = Field(alias='isPrivate')
    is_superuser: bool = Field(alias='isSuperuser')
