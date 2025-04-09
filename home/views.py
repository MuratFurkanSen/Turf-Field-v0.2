from django.shortcuts import render
from user.forms import UserRegistrationForm, UserLoginForm

# Create your views here.
def home(request):
    return render(request, 'home.html', {})

def header_register_login_forms(request):
    register_form = UserRegistrationForm()
    login_form = UserLoginForm()
    return {
        'registration_form': register_form,
        'login_form': login_form,
    }