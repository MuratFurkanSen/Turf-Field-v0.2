from django.urls import path
from reservation import views

urlpatterns = [
    path('', views.reservation_home),
    path('make_reservation/', views.make_reservation, name='make_reservation'),
    path('make_payment/', views.make_payment, name='make_payment'),
    path('manuel_timeout/', views.manuel_timeout, name='manuel_timeout'),
    path('put_on_hold/', views.put_reservation_on_hold, name='put_reservation_on_hold'),
    path('get_review_pending_users/', views.send_review_pending_users, name='get_review_pending_users'),
    path('submit_review/', views.submit_review,name='submit_review'),
]
