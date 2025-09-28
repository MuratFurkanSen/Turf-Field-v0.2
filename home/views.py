from django.http import JsonResponse
from django.shortcuts import render, redirect

import user
from user.forms import UserRegistrationForm, UserLoginForm, VendorRegistrationForm
from user.models import Transaction


# Create your views here.
def home(request):
    if request.user.is_authenticated and request.user.profile.role == 'vendor':
        return redirect('/facility')
    return render(request, 'home.html', {})


def header_register_login_forms(request):
    register_form = UserRegistrationForm()
    login_form = UserLoginForm()
    vendor_registration_form = VendorRegistrationForm()
    return {
        'registration_form': register_form,
        'login_form': login_form,
        'vendor_registration_form': vendor_registration_form,
    }


def player_card(request):
    return render(request, 'playerCard.html')


def wallet(request):
    transactions = Transaction.objects.all().order_by('-date')
    context = {'transactions': transactions}
    return render(request, 'wallet.html', context)


def load_balance(request):
    if request.method == 'POST':
        card_holder_name = request.POST.get('card_name')
        card_number = request.POST.get('card_number')
        amount = request.POST.get('amount')
        exp_date = request.POST.get('exp_date')
        cvv = request.POST.get('cvv')
        if make_transaction(card_holder_name, card_number, amount, exp_date, cvv):
            Transaction.objects.create(user_profile=request.user.profile,
                                       type="Load",
                                       amount=amount)

            request.user.profile.wallet_balance += int(amount)
            request.user.profile.save()
            return redirect('/home/wallet')
        else:
            return JsonResponse({'error': 'İşlem Gerçekleştirilemedi'})
    return render(request, 'wallet.html')


def make_transaction(card_holder_name, card_number, amount, exp_date, cvv):
    return True


def test(request):
    return render(request, 'fields_home.html', {})