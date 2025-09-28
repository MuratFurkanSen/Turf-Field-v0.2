import json
from decimal import Decimal, ROUND_HALF_UP

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render

from field.models import Field, ReservationHour
from reservation.models import Reservation
from team.models import Team
from user.models import Transaction


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

    selected_players = User.objects.filter(pk__in=data['selected_player_pks'])
    reservation = Reservation.objects.filter(pk=data.get('reservation_pk'))
    if not reservation.exists():
        return JsonResponse({'success': False})

    if not selected_players.exists():
        return JsonResponse({'success': False})
    reservation = reservation.first()

    per_player_cost = reservation.remaining_cost / reservation.ower_players.count()
    payment_cost = per_player_cost * selected_players.count()
    payment_cost = payment_cost.quantize(Decimal('.01'), rounding=ROUND_HALF_UP)

    if request.user.profile.wallet_balance < payment_cost:
        return JsonResponse({'success': False, 'status': 'Insufficient Funds'})

    request.user.profile.wallet_balance -= payment_cost


    Transaction.objects.create(user_profile=request.user.profile,
                               type="Expense",
                               amount=payment_cost * -1)

    reservation.remaining_cost -= payment_cost
    for player in selected_players:
        reservation.ower_players.remove(player.profile)
    reservation.paid_users[f'{request.user.id}'] = str(payment_cost)

    if reservation.remaining_cost == 0:
        reservation.status = 'active'

    request.user.profile.save()
    reservation.save()

    return JsonResponse({'success': True, 'status': 'Complete'})
