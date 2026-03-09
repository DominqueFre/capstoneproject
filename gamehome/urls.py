from django.urls import path
from . import views

app_name = "gamehome"

urlpatterns = [
    path("", views.play, name="home"),
    path("profile/", views.profile, name="profile"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("api/score/", views.submit_score, name="submit_score"),
]
