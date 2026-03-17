import json
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.http import (
    JsonResponse,
)
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .forms import MemberCommentForm, MemberAvatarForm, MemberChoiceForm
from .models import (
    GameScore,
    MemberDrawPost,
    MemberInformation,
    MemberLosePost,
    MemberMovePost,
    MemberWinPost,
    MemberAvatar,
    MemberChoice,
)


MAX_COMMENTS_PER_TYPE = 10

COMMENT_MODEL_MAP = {
    "win": (MemberWinPost, "winpost"),
    "lose": (MemberLosePost, "losepost"),
    "draw": (MemberDrawPost, "drawpost"),
    "move": (MemberMovePost, "movepost"),
}

TIER_TO_THEMES = {
    "guest": ["traditional"],
    "novice": ["traditional", "fantasy"],
    "seasoned": ["traditional", "fantasy", "robot"],
    "master": ["traditional", "fantasy", "robot", "flowers"],
}

TIER_TO_DIFFICULTIES = {
    "guest": ["easy"],
    "novice": ["easy", "normal"],
    "seasoned": ["easy", "normal", "hard"],
    "master": ["easy", "normal", "hard", "fiendish"],
}


def get_user_message_sets(user):
    empty_sets = {"win": [], "lose": [], "draw": [], "move": []}
    if not user.is_authenticated:
        return empty_sets, False

    message_sets = {}
    all_filled = True

    for key, (model_class, comment_field) in COMMENT_MODEL_MAP.items():
        rows = model_class.objects.filter(user=user).values_list(
            comment_field,
            flat=True,
        )
        cleaned = [
            text.strip()
            for text in rows
            if isinstance(text, str) and text.strip()
        ]
        message_sets[key] = cleaned
        if len(cleaned) < MAX_COMMENTS_PER_TYPE:
            all_filled = False

    for key in ("win", "lose", "draw", "move"):
        message_sets.setdefault(key, [])

    return message_sets, all_filled


def get_member_access(user):
    allowed_themes = TIER_TO_THEMES["guest"]
    allowed_difficulties = TIER_TO_DIFFICULTIES["guest"]
    member_tier = "guest"

    if user.is_authenticated:
        user_scores = GameScore.objects.filter(user=user)
        total_games = user_scores.count()
        losses = user_scores.filter(outcome="L").count()
        loss_percent = (losses / total_games * 100) if total_games else 100

        if total_games >= 50 and loss_percent < 10:
            member_tier = "master"
        elif total_games >= 30 and loss_percent < 20:
            member_tier = "seasoned"
        else:
            member_tier = "novice"

        allowed_themes = TIER_TO_THEMES[member_tier]
        allowed_difficulties = TIER_TO_DIFFICULTIES[member_tier]

    return member_tier, allowed_themes, allowed_difficulties


def home(request):
    return render(request, "gamehome/home.html")


def play(request):
    # Theme availability is based on account state and performance tier.
    member_tier, allowed_themes, allowed_difficulties = get_member_access(
        request.user
    )

    user_message_sets, user_messages_ready = get_user_message_sets(
        request.user
    )

    game_piece_preference = None
    if request.user.is_authenticated:
        avatar_obj = MemberAvatar.objects.filter(user=request.user).first()
        choice_obj = MemberChoice.objects.filter(user=request.user).first()
        # Determine the correct choice for serialization
        if choice_obj:
            is_selection = (
                choice_obj.choice == "Selection"
                and choice_obj.piece_identifier
            )
            if is_selection:
                choice_val = "Selection"
                piece_identifier = choice_obj.piece_identifier
            elif choice_obj.choice == "Standard":
                choice_val = "Standard"
                piece_identifier = None
            else:
                choice_val = "Random"
                piece_identifier = None
        else:
            choice_val = "Standard"
            piece_identifier = None
        game_piece_preference = json.dumps(
            {
                "choice": choice_val,
                "pieceIdentifier": piece_identifier,
                "avatarImage": (
                    avatar_obj.avatar_image
                    if avatar_obj and avatar_obj.avatar_image
                    else None
                ),
            }
        )

    context = {
        "allowed_themes": allowed_themes,
        "allowed_difficulties": allowed_difficulties,
        "member_tier": member_tier,
        "game_user_messages": json.dumps(user_message_sets),
        "game_user_messages_ready": user_messages_ready,
        "game_piece_preference": game_piece_preference,
        "profile_display_name": (
            getattr(
                getattr(request.user, "member_info", None),
                "gamername",
                None,
            )
            if request.user.is_authenticated
            else None
        ),
    }
    return render(request, "gamehome/play.html", context)


@login_required
def profile(request):
    member_tier, allowed_themes, allowed_difficulties = get_member_access(
        request.user
    )

    selected_type = request.GET.get("type", "win")
    if selected_type not in COMMENT_MODEL_MAP:
        selected_type = "win"

    feedback_message = ""
    editing_comment = None
    form = MemberCommentForm(initial={"message_type": selected_type})

    # Initialize avatar and choice forms
    avatar_obj, _ = MemberAvatar.objects.get_or_create(user=request.user)
    choice_obj, _ = MemberChoice.objects.get_or_create(user=request.user)

    if choice_obj.choice not in {"Standard", "Random", "Selection"}:
        choice_obj.choice = "Standard"
        choice_obj.piece_identifier = None
        choice_obj.save(update_fields=["choice", "piece_identifier"])
    elif choice_obj.choice == "Selection" and not choice_obj.piece_identifier:
        choice_obj.choice = "Random"
        choice_obj.save(update_fields=["choice"])

    avatar_form = MemberAvatarForm(instance=avatar_obj)
    choice_form = MemberChoiceForm(instance=choice_obj, tier=member_tier)

    current_member_name = getattr(
        getattr(request.user, "member_info", None),
        "gamername",
        "",
    )
    profile_display_name = current_member_name or request.user.username

    if request.method == "POST":
        action = request.POST.get("action", "save")
        if action == "save_profile":
            requested_name = request.POST.get("display_name", "").strip()

            if not requested_name:
                feedback_message = "Display name cannot be empty."
            elif len(requested_name) > 20:
                feedback_message = (
                    "Display name must be 20 characters or fewer."
                )
            elif (
                MemberInformation.objects
                .filter(gamername__iexact=requested_name)
                .exclude(user=request.user)
                .exists()
            ):
                feedback_message = "That display name is already in use."
            else:
                status_value = (
                    member_tier
                    if member_tier in {"novice", "seasoned", "master"}
                    else "novice"
                )
                member_info, _ = MemberInformation.objects.get_or_create(
                    user=request.user,
                    defaults={
                        "gamername": requested_name,
                        "status": status_value,
                    },
                )
                member_info.gamername = requested_name
                member_info.save(update_fields=["gamername"])
                profile_display_name = requested_name
                current_member_name = ""
                feedback_message = "Display name saved."

            form = MemberCommentForm(initial={"message_type": selected_type})
        elif action == "save_avatar":
            avatar_form = MemberAvatarForm(request.POST, instance=avatar_obj)
            if avatar_form.is_valid():
                avatar_form.save()
                avatar_form = MemberAvatarForm(instance=avatar_obj)
                feedback_message = "Avatar saved."
            else:
                feedback_message = "Failed to save avatar."
        elif action == "save_choice":
            choice_form = MemberChoiceForm(
                request.POST, instance=choice_obj, tier=member_tier
            )
            if choice_form.is_valid():
                saved_choice = choice_form.save(commit=False)
                if saved_choice.choice == "Selection":
                    if not choice_obj.piece_identifier:
                        feedback_message = (
                            "Choose a gallery piece before saving a "
                            "selected piece."
                        )
                    else:
                        saved_choice.save()
                        choice_form = MemberChoiceForm(
                            instance=saved_choice, tier=member_tier
                        )
                        feedback_message = "Selected piece preference saved."
                else:
                    saved_choice.piece_identifier = None
                    saved_choice.save()
                    choice_form = MemberChoiceForm(
                        instance=saved_choice, tier=member_tier
                    )
                    feedback_message = (
                        "Random preference saved. Your piece will be chosen "
                        "from the global image pool when you play."
                    )
            else:
                feedback_message = "Failed to save game piece choice."
        elif action == "save_gallery_piece":
            selected_piece_id = request.POST.get(
                "selected_piece_id", ""
            ).strip()
            if selected_piece_id:
                choice_obj.piece_identifier = selected_piece_id
                choice_obj.choice = "Selection"
                choice_obj.full_clean()
                choice_obj.save()
                choice_form = MemberChoiceForm(
                    instance=choice_obj, tier=member_tier
                )
                feedback_message = f"Piece {selected_piece_id} selected!"
            else:
                feedback_message = "Please select a piece first."
        elif action == "reset_choice":
            choice_obj.choice = "Random"
            choice_obj.piece_identifier = None
            choice_obj.full_clean()
            choice_obj.save()
            choice_form = MemberChoiceForm(
                instance=choice_obj,
                tier=member_tier,
            )
            feedback_message = (
                "Game piece choice reset to Random using the global pool."
            )
        elif action == "delete":
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
        "profile_member_name": current_member_name,
        "profile_display_name": profile_display_name,
        "allowed_themes": allowed_themes,
        "allowed_difficulties": allowed_difficulties,
        "member_tier": member_tier,
        "avatar_form": avatar_form,
        "choice_form": choice_form,
        "has_avatar": bool(avatar_obj.avatar_image),
    }
    return render(request, "gamehome/profile.html", context)


def leaderboard(request):
    difficulty_options = ["all", "easy", "normal", "hard", "fiendish"]
    selected_difficulty = request.GET.get("difficulty", "all").lower()
    if selected_difficulty not in difficulty_options:
        selected_difficulty = "all"

    score_rows = GameScore.objects.all()
    if selected_difficulty != "all":
        score_rows = score_rows.filter(difficulty=selected_difficulty)

    rows_raw = (
        score_rows.values(
            "user__username",
            "user__member_info__gamername",
        )
        .annotate(
            wins=Count("id", filter=Q(outcome="W")),
            losses=Count("id", filter=Q(outcome="L")),
            draws=Count("id", filter=Q(outcome="D")),
            total=Count("id"),
        )
        .filter(Q(wins__gt=0) | Q(draws__gt=0))
        .order_by("-wins", "-draws", "losses", "user__username")
    )

    rows = []
    for row in rows_raw:
        total = row["total"]
        wins = row["wins"]
        draws = row["draws"]
        row["display_name"] = (
            row.get("user__member_info__gamername")
            or row.get("user__username")
        )
        row["win_percentage"] = (wins / total * 100) if total else 0
        row["total_percentage"] = (
            ((wins + draws) / total * 100) if total else 0
        )
        rows.append(row)

    rows.sort(
        key=lambda row: (
            -row["total_percentage"],
            -row["win_percentage"],
            row["display_name"].lower(),
        )
    )

    for index, row in enumerate(rows, start=1):
        row["position"] = index

    top_rows = rows[:20]

    current_user_row = None
    if request.user.is_authenticated:
        current_user_row = next(
            (
                row for row in rows
                if row.get("user__username") == request.user.username
            ),
            None,
        )

    context = {
        "rows": top_rows,
        "current_user_row": current_user_row,
        "selected_difficulty": selected_difficulty,
        "difficulty_options": difficulty_options,
    }
    return render(request, "gamehome/leaderboard.html", context)


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



