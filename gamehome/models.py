from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class MemberInformation(models.Model):
    STATUS_CHOICES = [
        ("novice", "Novice"),
        ("seasoned", "Seasoned"),
        ("master", "Master"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="member_info")
    gamername = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default="novice")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.gamername} ({self.status})"


class GameScore(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("normal", "Normal"),
        ("hard", "Hard"),
        ("fiendish", "Fiendish"),
    ]
    OUTCOME_CHOICES = [
        ("W", "Win"),
        ("L", "Loss"),
        ("D", "Draw"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="game_scores")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    outcome = models.CharField(max_length=1, choices=OUTCOME_CHOICES, default="L")
    played_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-played_on"]


class MemberWinPost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="win_posts")
    winpost = models.CharField(max_length=200, blank=True, null=True)


class MemberLosePost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lose_posts")
    losepost = models.CharField(max_length=200, blank=True, null=True)


class MemberDrawPost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="draw_posts")
    drawpost = models.CharField(max_length=200, blank=True, null=True)

    def clean(self):
        if self.drawpost:
            qs = MemberDrawPost.objects.filter(user=self.user, drawpost=self.drawpost)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            if qs.count() >= 10:
                raise ValidationError("A user can only use the same draw comment up to 10 times.")


class MemberMovePost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="move_posts")
    movepost = models.CharField(max_length=200, blank=True, null=True)


class MemberAvatar(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="avatar")
    avatar_image = models.URLField(blank=True, null=True)

    def clean(self):
        member = getattr(self.user, "member_info", None)
        if not member or member.status not in {"seasoned", "master"}:
            raise ValidationError("Avatar is only available to seasoned and master players.")


class MemberChoice(models.Model):
    CHOICE_CHOICES = [
        ("Random", "Random"),
        ("X", "X"),
        ("O", "O"),
        ("Selection", "Selection"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="choice")
    choice = models.CharField(max_length=20, choices=CHOICE_CHOICES, default="Random")
    piece_identifier = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Stores selected piece identifier (e.g., 'robot_0', 'avatar', 'traditional_1')"
    )

    def clean(self):
        member = getattr(self.user, "member_info", None)
        if not member or member.status not in {"seasoned", "master"}:
            raise ValidationError("Choice is only available to seasoned and master players.")
