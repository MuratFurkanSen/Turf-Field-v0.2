import json

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render

from field.models import Field, ReservationHour
from reservation.models import Reservation
from team.models import Team
from user.models import AppUserProfile


# Create your views here.
def reservation_home(request):
    return render(request, 'reservations.html', {})


def make_reservation(request):
    data = json.loads(request.body.decode('utf-8'))
    field_pk = data.get('field_pk')
    reservation_hour_pk = data.get('reservation_hour_pk')
    team_pk = data.get('team_pk')
    field = Field.objects.filter(pk=field_pk)
    reservation_hour = ReservationHour.objects.filter(pk=reservation_hour_pk)
    team = Team.objects.filter(pk=team_pk)

    if not (field.exists() and reservation_hour.exists() and team.exists()):
        return JsonResponse({'success': False})
    field = field.first()
    reservation_hour = reservation_hour.first()
    team = team.first()
    if reservation_hour.is_reserved:
        return JsonResponse({'success': False})
    reservation_hour.is_reserved = True
    reservation_hour.save()
    reservation = Reservation.objects.create(
        date=reservation_hour.date,
        start_hour=reservation_hour.start_hour.hour,
        belonged_team=team,
        reserved_field=field,
        total_cost=reservation_hour.price,
        remaining_cost=reservation_hour.price,
        status='payment',
    )
    reservation.ower_players.set(team.members.all())
    return JsonResponse({'success': True})

def make_payment(request):
    data = json.loads(request.body.decode('utf-8'))
    reservation_pk = data.get('reservation_hour_pk')
    selected_players = User.objects.filter(pk__in=data['selected_player_pks'])
    reservation = Reservation.objects.get(pk=reservation_pk)
    per_player_cost = reservation.remaining_cost //reservation.ower_players.count()
    return JsonResponse({'success': True, 'status': 'Complete'})


