from django.shortcuts import render

# Create your views here.
def fields(request):
    return render(request, 'fields.html', {})
