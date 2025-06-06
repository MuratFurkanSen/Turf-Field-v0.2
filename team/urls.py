from django.urls import path
from team import views

urlpatterns = [
    path('<int:pk>', views.team_main),
    path('get/', views.send_teams, name='send_teams'),
    path('create/', views.create_team, name='create_team'),
    path('delete/<int:pk>/', views.delete_team, name='create_team'),
    path('search/', views.search_team, name='search_team'),
    path('join/<int:team_pk>/', views.send_join_request, name='send_join_request'),
    path('invite/<int:team_pk>/', views.send_invite, name='send_invite'),
    path('invite/accept/<int:invite_pk>/', views.accept_invite, name='accept_invite'),
    path('invite/deny/<int:invite_pk>/', views.deny_invite, name='deny_invite'),

]
