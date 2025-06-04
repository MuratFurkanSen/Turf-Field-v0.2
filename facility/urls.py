from django.urls import path
from facility import views

app_name = 'facility'

urlpatterns = [
    path('', views.facility_home, name='facility_home'),
    path('profile', views.facility_profile, name='facility_profile'),
    path('calendar', views.facility_calendar, name='facility_calendar'),
    path('reports', views.reports, name='reports'),
    path('facilities', views.facility_dashboard, name='facility_dashboard'),
    path('get/', views.send_facilities, name='send_facilities'),
    path('create', views.facility_creation, name='facility_create'),
    path('delete/<int:pk>/', views.facility_delete, name='delete'),
    path('fields/<int:pk>/', views.field_dashboard, name='field_dashboard'),
    path('field/create/<int:pk>/', views.field_creation, name='field_create'),
    path('field/edit/<int:pk>/', views.field_edit, name='field_edit'),
    path('field/delete/<int:pk>/', views.field_delete, name='field_delete'),
]
