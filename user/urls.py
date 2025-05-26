from django.urls import path
from user import views

urlpatterns = [
    path('register', views.app_user_register),
    path('login', views.user_login),
    path('logout', views.user_logout),
    path('send-otp', views.handle_otp_request, name="send_otp"),
    path('verify-otp', views.verify_otp, name="verify_otp"),
    path('reset-password', views.reset_password, name="reset_password"),
    path('profile', views.user_profile, name='profile'),
    path('update_user_info', views.update_profile_info, name='update_profile_info'),
    path('vendor_registration', views.vendor_register, name='vendor_registration'),
]
