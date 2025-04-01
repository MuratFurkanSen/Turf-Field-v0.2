from django.urls import path
from field import views

urlpatterns = [
    path('', views.fields),
]
