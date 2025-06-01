from django.urls import path
from field import views

urlpatterns = [
    path('', views.fields),
    path('schedule/get/<int:pk>/', views.send_schedule, name='send_schedule'),
    path('schedule/save/<int:pk>/', views.save_schedule, name='save_schedule'),
]
