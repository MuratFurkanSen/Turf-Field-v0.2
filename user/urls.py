from django.urls import path
from user import views

urlpatterns = [
    path('register', views.user_register),
    path('login', views.user_login),
    path('logout', views.user_logout),

]
