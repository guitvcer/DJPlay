from django.contrib import admin

from . import models


admin.site.register(models.MainUser)
admin.site.register(models.Game)
admin.site.register(models.Queue)
admin.site.register(models.FriendRequest)
