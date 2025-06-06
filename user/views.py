from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import EmailMessage
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import render, redirect
import random

from django.template.loader import render_to_string

from .forms import UserRegistrationForm, UserLoginForm, UserProfileUpdateForm, VendorRegistrationForm, \
    VendorProfileUpdateForm
from .models import AppUserProfile, VendorProfile


# Create your views here.
def profile_required(required_role):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return HttpResponseForbidden("You must be logged in.")

            profile = getattr(request.user, 'profile', None)
            if profile and profile.role == required_role:
                return view_func(request, *args, **kwargs)
            return HttpResponseForbidden("You do not have access to this page.")

        return wrapper

    return decorator


def app_user_register(request):
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


def vendor_register(request):
    if request.method == 'POST':
        form = VendorRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('/facility')
        else:
            errors = []
            for error_list in form.errors.values():
                errors.extend(error_list.as_text().replace('*', '').split('\n'))
            return JsonResponse({'errors': errors})
    return redirect('facility')


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
    if request.user.profile.role == 'vendor':
        return redirect('/facility')
    else:
        return redirect('/')


@login_required
def user_logout(request):
    if request.user.is_authenticated:
        logout(request)
    return redirect('/')


@login_required
def user_profile(request):
    if request.user.profile.role == 'app_user':
        curr_profile = AppUserProfile.objects.get(user_id=request.user.id)
    else:
        curr_profile = VendorProfile.objects.get(user_id=request.user.id)
    return render(request, "profileInfo.html", {'user_profile': curr_profile})


@login_required
def update_profile_info(request):
    profile = request.user.profile
    role = profile.role

    if request.method == 'POST':
        if role == 'app_user':
            form = UserProfileUpdateForm(request.POST, request.FILES, instance=profile, user=request.user)
        else:
            form = VendorProfileUpdateForm(request.POST, request.FILES, instance=profile, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profiliniz güncellendi.')
            return redirect('/user/profile')
        else:
            errors = []
            for error_list in form.errors.values():
                errors.extend(error_list.as_text().replace('*', '').split('\n'))
            return JsonResponse({'errors': errors})
    if role == 'app_user':
        form = UserProfileUpdateForm(instance=profile, user=request.user, initial={'email': request.user.email})
    else:
        form = VendorProfileUpdateForm(instance=profile, user=request.user, initial={'email': request.user.email})
    return render(request, 'profileInfo.html', {'form': form, 'user_profile': profile})


def handle_otp_request(request):
    if request.method == 'POST':
        phone_number = request.POST.get('phone_number')
        profile = AppUserProfile.objects.filter(phone_number=phone_number)

        if len(profile.values()) != 0:
            profile = profile[0]
            request.session['user_id'] = profile.user.id
            send_otp(request, profile)
            return JsonResponse({'success': True})
        else:
            return JsonResponse(
                {'success': False, 'errors': ['Bu Telefon Numarası ile Kayıtlı Bir Kullanıcı Bulunamadı']})
    return JsonResponse({'success': False})


def send_otp(request, profile):
    otp = f"{random.randint(0, 999_999)}".zfill(6)
    request.session['otp'] = otp

    subject = "Şifre Sıfırlama Talebiniz"

    html_content = render_to_string('forgot_password_email.html', {'otp': otp})

    email = EmailMessage(
        subject=subject,
        body=html_content,
        to=(profile.user.email,)
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


def send_team_invites(request):
    invite_objects = request.user.profile.team_invites.all()
    team_invites = []
    for invite_object in invite_objects:
        team = invite_object.team
        team_invites.append({
            'id': invite_object.id,
            'team_name': team.name,
            'member_count': team.members.count(),
            'captain_username': team.captain.user.username,
        })

    return JsonResponse({'success': True, 'invites': team_invites})