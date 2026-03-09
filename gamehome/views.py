import json
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import GameScore


def home(request):
    return render(request, "gamehome/home.html")


def play(request):
    return render(request, "gamehome/play.html")


def leaderboard(request):
    rows = (
        GameScore.objects.values("user__username")
        .annotate(
            wins=Count("id", filter=Q(outcome="W")),
            losses=Count("id", filter=Q(outcome="L")),
            draws=Count("id", filter=Q(outcome="D")),
            total=Count("id"),
        )
        .order_by("-wins", "-draws", "losses", "user__username")
    )
    return render(request, "gamehome/leaderboard.html", {"rows": rows})


@csrf_exempt
@require_POST
def submit_score(request):
    try:
        if not request.user.is_authenticated:
            return JsonResponse(
                {"ok": False, "error": "authentication required"},
                status=401,
            )

        payload = json.loads(request.body or "{}")
        difficulty = payload.get("difficulty", "easy").lower().strip()
        outcome = payload.get("outcome", "L").upper().strip()

        if difficulty not in {"easy", "normal", "hard", "fiendish"}:
            return JsonResponse(
                {"ok": False, "error": "invalid difficulty"},
                status=400,
            )

        if outcome not in {"W", "L", "D"}:
            return JsonResponse(
                {"ok": False, "error": "invalid outcome"},
                status=400,
            )

        score = GameScore.objects.create(
            user=request.user,
            difficulty=difficulty,
            outcome=outcome,
        )
        return JsonResponse({"ok": True, "score_id": score.id})
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "invalid JSON"}, status=400)
