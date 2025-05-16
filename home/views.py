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

def player_card(request):
    return render(request, 'playerCard.html')


def wallet(request):
    return render(request, 'wallet.html')

def load_balance(request):
    if request.method == 'POST':
        pass
    return render(request, 'wallet.html')