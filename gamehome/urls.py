from django.urls import path
from . import views

app_name = "gamehome"

urlpatterns = [
    path("", views.play, name="home"),
    path("play/", views.play, name="play"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("api/score/", views.submit_score, name="submit_score"),
]
