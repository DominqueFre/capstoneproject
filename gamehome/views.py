import json
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .forms import MemberCommentForm
from .models import (
    GameScore,
    MemberDrawPost,
    MemberLosePost,
    MemberMovePost,
    MemberWinPost,
)


MAX_COMMENTS_PER_TYPE = 10

COMMENT_MODEL_MAP = {
    "win": (MemberWinPost, "winpost"),
    "lose": (MemberLosePost, "losepost"),
    "draw": (MemberDrawPost, "drawpost"),
    "move": (MemberMovePost, "movepost"),
}


def home(request):
    return render(request, "gamehome/home.html")


def play(request):
    return render(request, "gamehome/play.html")


@login_required
def profile(request):
    selected_type = request.GET.get("type", "win")
    if selected_type not in COMMENT_MODEL_MAP:
        selected_type = "win"

    feedback_message = ""
    editing_comment = None
    form = MemberCommentForm(initial={"message_type": selected_type})

    if request.method == "POST":
        action = request.POST.get("action", "save")
        if action == "delete":
            delete_type = request.POST.get("delete_type", "win")
            delete_id = request.POST.get("delete_id", "")
            if delete_type not in COMMENT_MODEL_MAP:
                delete_type = "win"
            selected_type = delete_type

            if delete_id.isdigit():
                model_class, _ = COMMENT_MODEL_MAP[delete_type]
                comment_obj = get_object_or_404(
                    model_class.objects.filter(user=request.user),
                    pk=int(delete_id),
                )
                comment_obj.delete()
                feedback_message = "Comment deleted."
            else:
                feedback_message = "Invalid delete request."

            form = MemberCommentForm(initial={"message_type": selected_type})
        else:
            form = MemberCommentForm(request.POST)
            selected_type = request.POST.get("message_type", selected_type)
            if selected_type not in COMMENT_MODEL_MAP:
                selected_type = "win"

            if form.is_valid():
                message_type = form.cleaned_data["message_type"]
                comment_text = form.cleaned_data["comment_text"]
                comment_id = form.cleaned_data.get("comment_id")
                model_class, comment_field = COMMENT_MODEL_MAP[message_type]
                user_comments = model_class.objects.filter(user=request.user)

                if comment_id:
                    comment_obj = get_object_or_404(
                        user_comments,
                        pk=comment_id,
                    )
                    setattr(comment_obj, comment_field, comment_text)
                    comment_obj.full_clean()
                    comment_obj.save(update_fields=[comment_field])
                    feedback_message = "Comment updated."
                    form = MemberCommentForm(
                        initial={"message_type": message_type}
                    )
                    selected_type = message_type
                else:
                    if user_comments.count() >= MAX_COMMENTS_PER_TYPE:
                        form.add_error(
                            None,
                            (
                                "You already entered 10 comments for this "
                                "message type."
                            ),
                        )
                    else:
                        comment_obj = model_class(user=request.user)
                        setattr(comment_obj, comment_field, comment_text)
                        comment_obj.full_clean()
                        comment_obj.save()
                        feedback_message = "Comment saved."
                        form = MemberCommentForm(
                            initial={"message_type": message_type}
                        )
                        selected_type = message_type

    comments_by_type = {}
    comment_counts = {}
    for key, (model_class, comment_field) in COMMENT_MODEL_MAP.items():
        raw_rows = (
            model_class.objects.filter(user=request.user)
            .order_by("-id")
        )
        comments = [
            {
                "id": row.id,
                "text": getattr(row, comment_field) or "",
            }
            for row in raw_rows
        ]
        comments_by_type[key] = comments
        comment_counts[key] = len(comments)

    if request.method == "GET":
        edit_id = request.GET.get("edit")
        if (
            edit_id
            and edit_id.isdigit()
            and selected_type in COMMENT_MODEL_MAP
        ):
            model_class, comment_field = COMMENT_MODEL_MAP[selected_type]
            editing_comment = get_object_or_404(
                model_class.objects.filter(user=request.user),
                pk=int(edit_id),
            )
            form = MemberCommentForm(
                initial={
                    "message_type": selected_type,
                    "comment_text": (
                        getattr(editing_comment, comment_field) or ""
                    ),
                    "comment_id": editing_comment.id,
                }
            )

    if form.is_bound and not form.errors:
        editing_comment = None
    elif form.is_bound and form.cleaned_data.get("comment_id"):
        editing_comment = {"id": form.cleaned_data.get("comment_id")}

    can_add_comment = (
        comment_counts.get(selected_type, 0) < MAX_COMMENTS_PER_TYPE
    )
    if editing_comment:
        can_add_comment = True

    context = {
        "form": form,
        "selected_type": selected_type,
        "comments_by_type": comments_by_type,
        "comment_counts": comment_counts,
        "max_comments_per_type": MAX_COMMENTS_PER_TYPE,
        "can_add_comment": can_add_comment,
        "feedback_message": feedback_message,
        "editing_comment": editing_comment,
    }
    return render(request, "gamehome/profile.html", context)


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
