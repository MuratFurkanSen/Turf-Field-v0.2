from django.urls import path
from user import views

urlpatterns = [
    path('register', views.user_register),
    path('login', views.user_login),
    path('logout', views.user_logout),
    path('profile', views.profile),
    path('update_user_info', views.update_user_info),
    path('temp', views.user_info_edit),


]
