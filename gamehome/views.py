from django.http import HttpResponse


def home(request):
	return HttpResponse("Game home is running.")
