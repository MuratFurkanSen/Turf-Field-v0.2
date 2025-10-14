import json
from decimal import Decimal, ROUND_HALF_UP

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render

from field.models import Field, ReservationHour
from reservation.models import Reservation
from team.models import Team
from user.models import Transaction, AppUserProfile
from .tasks import payment_timeout


# Create your views here.
def reservation_home(request):
    teams = Team.objects.filter(members=request.user.profile)
    reservations = Reservation.objects.filter(belonged_team__in=teams)
    facilities = []
    slots = []
    review_pending_users = []
    for reservation in reservations:
        facilities.append(reservation.reserved_field.belonged_facility)
        slots.append(f'{str(reservation.start_hour).zfill(2)}-{str(reservation.start_hour + 1).zfill(2)}')
        review_pending_users.append(reservation.review_pending_users.get(f'{request.user.profile.id}', []))
    context = {'reservation_data': zip(reservations, facilities, slots, review_pending_users)}
    return render(request, 'reservations.html', context)


# User Field Page Reservation Creation APIs
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
        hour_slot=reservation_hour,
        status='payment',
    )
    reservation.ower_players.set(team.members.all())
    payment_timeout.apply_async()
    return JsonResponse({'success': True})


# User Team Page Reservation Card APIs
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
        reservations = reservation.hour_slot.reservations.all()
        if len(reservations) > 1:
            for res in reservations:
                if res.status == 'on_hold':
                    for player_id, amount in res.paid_users.items():
                        player = AppUserProfile.objects.get(player_id)
                        player.wallet_balance += amount
                        player.save()
                    res.paid_users.clear()
                    res.status = 'cancelled'
                    res.save()
        else:
            reservation.reserved_field.belonged_facility.belonged_vendor.wallet_balance += reservation.reserved_field.deposit_fee

    request.user.profile.save()
    reservation.save()
    reservation.reserved_field.belonged_facility.belonged_vendor.save()

    return JsonResponse({'success': True, 'status': 'Complete'})


def manuel_timeout(request):
    data = json.loads(request.body.decode('utf-8'))
    reservation_pk = data.get('reservation_pk')
    reservation = Reservation.objects.filter(pk=reservation_pk)
    if not reservation.exists():
        return JsonResponse({'success': False})
    reservation = reservation.first()
    if request.user.profile != reservation.belonged_team.captain:
        return JsonResponse({'success': False, 'message': 'Bu işlemi yapabilmek için kaptan olmanız gerekiyor...'})
    payment_timeout.apply_async((reservation_pk,))
    return JsonResponse({'success': True})


def put_reservation_on_hold(request):
    data = json.loads(request.body.decode('utf-8'))
    reservation_pk = data.get('reservation_pk')
    reservation = Reservation.objects.filter(pk=reservation_pk)
    if not reservation.exists():
        return JsonResponse({'success': False})
    reservation = reservation.first()
    if request.user.profile != reservation.belonged_team.captain:
        return JsonResponse({'success': False, 'message': 'Bu işlemi yapabilmek için kaptan olmanız gerekiyor...'})
    slot = reservation.hour_slot
    slot.is_reserved = False
    slot.save()
    reservation.status = 'on_hold'
    reservation.save()
    return JsonResponse({'success': True})


def send_review_pending_users(request):
    data = json.loads(request.body.decode('utf-8'))
    reservation_pk = data.get('reservation_pk')

    reservation = Reservation.objects.filter(pk=reservation_pk)
    if not reservation.exists():
        return JsonResponse({'success': False})
    reservation = reservation.first()
    players = AppUserProfile.objects.filter(id__in=reservation.review_pending_users[f'{request.user.profile.id}'])
    players_data = []
    for player in players:
        players_data.append({
            'id': player.id,
            'username': player.user.username,
            'picture': player.profile_picture.url,
            'position': player.position,
        })
    return JsonResponse({'success': True, 'players': players_data})


def submit_review(request):
    data = json.loads(request.body.decode('utf-8'))
    reservation_pk = data.get('reservation_pk')
    reviewed_player_pk = data.get('player_pk')

    reservation = Reservation.objects.filter(pk=reservation_pk)
    reviewed_player = AppUserProfile.objects.filter(pk=reviewed_player_pk)

    if not reservation.exists():
        return JsonResponse({'success': False})

    if not reviewed_player.exists():
        return JsonResponse({'success': False})

    reservation = reservation.first()
    reviewed_player = reviewed_player.first()
    if not reviewed_player.id in reservation.review_pending_users[f'{request.user.profile.id}']:
        return JsonResponse({'success': False})

    stats = data['stats']
    stat_keys = {'acceleration', 'sprint_speed',
                 'attack_position', 'finishing', 'shot_power',
                 'vision', 'short_pass', 'long_pass',
                 'agility', 'ball_control', 'dribble',
                 'def_awareness', 'interceptions',
                 'stamina', 'strength'}

    if stat_keys != stats.keys():
        return JsonResponse({'success': False})

    for stat_key, stat_value in stats.items():
        try:
            stats[stat_key] = int(stat_value)
        except ValueError:
            return JsonResponse({'success': False})

    if not all([0 <= x <= 100 for x in stats.values()]):
        return JsonResponse({'success': False})

    reservation.review_pending_users[f'{request.user.profile.id}'].remove(reviewed_player.id)
    reviewed_player.skills.update_values(stats)

    reservation.save()
    reviewed_player.save()
    reviewed_player.skills.save()
    return JsonResponse({'success': True})
