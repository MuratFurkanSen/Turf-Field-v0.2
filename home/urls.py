from django.urls import path
from home import views

urlpatterns = [
    path('', views.home),
    path('card', views.player_card, name='player_card'),
    path('wallet', views.wallet, name='wallet'),
    path('load_balance', views.load_balance, name='load_balance'),

]
