from django.contrib.auth import login, authenticate, logout
from django.http import JsonResponse
from django.shortcuts import render, redirect
from pyexpat.errors import messages

from .forms import UserRegistrationForm, UserLoginForm


# Create your views here.
def user_register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
        else:
            errors = []
            for error_list in form.errors.values():
                errors.extend(error_list.as_text().replace('*', '').split('\n'))
            return JsonResponse({'errors': errors})
    return redirect('/')


def user_login(request):
    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
        else:
            errors = []
            for error_list in form.errors.values():
                errors.extend(error_list.as_text().replace('*', '').split('\n'))
            return JsonResponse({'errors': errors})
    return redirect('/')

def user_logout(request):
    if request.user.is_authenticated:
        logout(request)
    return redirect('/')

def user_info_edit(request):
    return render(request, "userInfoEdit.html", {})

def update_user_info(request):
    return redirect("/user/temp")
def profile(request):
    return redirect("/user/temp")