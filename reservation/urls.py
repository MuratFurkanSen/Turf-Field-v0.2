from django.urls import path
from reservation import views

urlpatterns = [
    path('', views.reservation_home),
    path('make_reservation/', views.make_reservation, name='make_reservation'),
    path('make_payment/', views.make_payment, name='make_payment'),
]
