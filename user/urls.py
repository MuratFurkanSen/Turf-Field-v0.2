from django.urls import path
from user import views

urlpatterns = [
    path('register', views.user_register),
    path('login', views.user_login),
    path('logout', views.user_logout),
    path('send-otp', views.handle_otp_request, name="send_otp"),
    path('verify-otp', views.verify_otp, name="verify_otp"),
    path('reset-password', views.reset_password, name="reset_password"),
    path('profile', views.user_profile, name='profile'),
    path('update_user_info', views.update_user_info, name='update_user_info'),
    path('card', views.player_card, name='player_card'),
]
