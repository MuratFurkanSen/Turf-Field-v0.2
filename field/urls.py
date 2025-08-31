from django.urls import path
from field import views



urlpatterns = [
    path('', views.fields_home),
    # Facility Owner Related
    path('schedule/get/<int:pk>/', views.send_schedule, name='send_schedule'),
    path('schedule/save/<int:pk>/', views.save_schedule, name='save_schedule'),
    path('get_facility/<int:pk>/', views.send_facility_fields, name='send_facilities'),
    path('get/calendar/<int:pk>/', views.send_calendar, name='send_calendar'),
    path('set/calendar/', views.update_calendar, name='update_calendar'),
    # Normal User
    path('get_user_facilities/', views.send_user_facilities, name='send_user_facilities'),
    path('get_field_hours/', views.send_field_hours, name='send_field_hours'),
    path('get_team_options', views.send_team_options, name='send_team_options'),



]
