from django.urls import path
from reservation import views

urlpatterns = [
    path('', views.reservations),
]
