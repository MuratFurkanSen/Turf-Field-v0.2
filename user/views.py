from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.shortcuts import render, redirect
import random

from django.template.loader import render_to_string

from .forms import UserRegistrationForm, UserLoginForm
from .models import UserProfile


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


def handle_otp_request(request):
    if request.method == 'POST':
        phone_number = request.POST.get('phone_number')
        user_profile = UserProfile.objects.filter(phone_number=phone_number)

        if len(user_profile.values()) != 0:
            user_profile = user_profile[0]
            request.session['user_id'] = user_profile.user.id
            send_otp(request, user_profile)
            return JsonResponse({'success': True})
        else:
            return JsonResponse(
                {'success': False, 'errors': ['Bu Telefon Numarası ile Kayıtlı Bir Kullanıcı Bulunamadı']})
    return JsonResponse({'success': False})


def send_otp(request, user_profile):
    otp = f"{random.randint(0, 999_999)}".zfill(6)
    request.session['otp'] = otp

    subject = "Şifre Sıfırlama Talebiniz"

    html_content = render_to_string('forgot_password_email.html', {'otp': otp})

    email = EmailMessage(
        subject=subject,
        body=html_content,
        to=(user_profile.user.email,)
    )
    email.content_subtype = 'html'
    email.send()


def verify_otp(request):
    if request.method == 'POST':
        if request.POST.get('otp') == request.session.get('otp'):
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': ['Girdiğiniz Doğrulama Kodu Yanlış...']})

    return JsonResponse({'success': False})


def reset_password(request):
    if request.method == 'POST':
        user = User.objects.get(id=request.session.get('user_id'))
        password1 = request.POST.get('new_password')
        password2 = request.POST.get('confirm_password')
        if password1 == password2:
            try:
                validate_password(password1, user=user)
                user.set_password(password1)
                user.save()
            except ValidationError as e:
                return JsonResponse({'success': False, 'errors': e.messages})
    return JsonResponse({'success': False})


def user_info_edit(request):
    return render(request, "userInfoEdit.html", {})


def update_user_info(request):
    return redirect("/user/temp")


def profile(request):
    return redirect("/user/temp")
