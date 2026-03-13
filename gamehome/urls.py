from django.urls import path
from . import views
from .views_piece_choice_api import save_piece_choice

app_name = "gamehome"

urlpatterns = [
    path("", views.play, name="home"),
    path("profile/", views.profile, name="profile"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("api/score/", views.submit_score, name="submit_score"),
    path("api/piece-choice/", save_piece_choice, name="save_piece_choice"),
]
