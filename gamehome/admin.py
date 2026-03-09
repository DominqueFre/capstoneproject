from django.contrib import admin
from .models import (
    MemberInformation,
    GameScore,
    MemberWinPost,
    MemberLosePost,
    MemberDrawPost,
    MemberMovePost,
    MemberAvatar,
    MemberChoice,
)

admin.site.register(MemberInformation)
admin.site.register(GameScore)
admin.site.register(MemberWinPost)
admin.site.register(MemberLosePost)
admin.site.register(MemberDrawPost)
admin.site.register(MemberMovePost)
admin.site.register(MemberAvatar)
admin.site.register(MemberChoice)
