import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import MemberChoice

@csrf_exempt
@require_POST
def save_piece_choice(request):
    if not request.user.is_authenticated:
        return JsonResponse({"ok": False, "error": "authentication required"}, status=401)
    try:
        data = json.loads(request.body or '{}')
        choice = data.get("choice")
        piece_identifier = data.get("piece_identifier")
        if choice not in {"Standard", "Random", "Selection"}:
            return JsonResponse({"ok": False, "error": "invalid choice"}, status=400)
        obj, _ = MemberChoice.objects.get_or_create(user=request.user)
        obj.choice = choice
        if choice == "Selection":
            if not piece_identifier:
                return JsonResponse({"ok": False, "error": "piece_identifier required for Selection"}, status=400)
            obj.piece_identifier = piece_identifier
        else:
            obj.piece_identifier = None
        obj.full_clean()
        obj.save()
        return JsonResponse({"ok": True, "choice": obj.choice, "piece_identifier": obj.piece_identifier})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=400)
