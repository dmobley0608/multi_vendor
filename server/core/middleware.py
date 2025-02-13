from django.http import HttpResponseRedirect
import re

class RedirectToRootMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        if not re.match(r'^/(api|admin)', path):
            return HttpResponseRedirect('/')
        return self.get_response(request)
