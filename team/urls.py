from django.urls import path
from team import views

urlpatterns = [
    path('<int:pk>', views.team_main),

    path('get/', views.send_teams, name='send_teams'),
    path('search/', views.search_team, name='search_team'),
    path('create/', views.create_team, name='create_team'),
    path('delete/<int:pk>/', views.delete_team, name='delete_team'),

    path('invite/<int:team_pk>/', views.send_invite, name='send_invite'),
    path('invite/accept/<int:invite_pk>/', views.accept_invite, name='accept_invite'),
    path('invite/deny/<int:invite_pk>/', views.deny_invite, name='deny_invite'),

    path('join/<int:team_pk>/', views.send_join_request, name='send_join_request'),
    path('join/accept/<int:request_pk>/', views.accept_join_request, name='accept_join_request'),
    path('join/deny/<int:request_pk>/', views.decline_join_request, name='decline_join_request'),

    path('get_positions/<int:team_pk>/', views.send_member_positions, name='send_member_positions'),
    path('save_positions/', views.save_member_positions, name='save_member_positions'),

]
