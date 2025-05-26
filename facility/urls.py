from django.urls import path
from facility import views

urlpatterns = [
    path('', views.facility_home, name='facility_home'),
    path('profile', views.facility_profile, name='facility_profile'),
    path('update_vendor_info', views.update_vendor_info, name='update_vendor_info'),
]
