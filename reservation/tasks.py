from unittest import case

from reservation.models import Reservation
from field.models import ReservationHour
from celery import shared_task

from user.models import AppUserProfile


@shared_task
def payment_timeout(reservation_id):
    reservation = Reservation.objects.get(pk=reservation_id)
    if reservation.status == 'payment':
        reservation.give_refund()
        reservation.paid_users.clear()
        reservation.ower_players.clear()
        reservation.status = 'timeout'
        slot = ReservationHour.objects.get(date__exact=reservation.date, start_hour__hour=reservation.start_hour)
        slot.is_reserved = False
        slot.save()
        reservation.save()


@shared_task
def reservation_start_time_arrival(reservation_id):
    reservation = Reservation.objects.get(pk=reservation_id)
    match reservation.status:
        case 'active':
            active_reservation_due_operations(reservation_id)
        case 'payment':
            payment_timeout(reservation_id)
        case 'past':
            pass
        case 'on_hold':
            on_hold_reservation_due_operations(reservation_id)
        case 'cancelled':
            pass
        case 'timeout':
            pass
        case _:
            raise Exception('Reservation Status not Recognized')

    reservation.save()


def active_reservation_due_operations(reservation_id):
    reservation = Reservation.objects.get(pk=reservation_id)

    deposit_fee = reservation.reserved_field.deposit_fee
    total_cost = reservation.total_cost

    reservation.reserved_field.belonged_facility.belonged_vendor.wallet_balance = total_cost - deposit_fee
    members = [member.id for member in reservation.belonged_team.members.all()]
    for member in members:
        copy = members.copy()
        copy.remove(member)
        reservation.review_pending_users[f'{member}'] = copy

    reservation.status = 'past'

    reservation.reserved_field.belonged_facility.belonged_vendor.save()
    reservation.save()


def on_hold_reservation_due_operations(reservation_id):
    reservation = Reservation.objects.get(pk=reservation_id)

    refund_amount = reservation.total_cost - reservation.reserved_field.deposit_fee
    for user_id, paid_amount in reservation.paid_users.keys():
        player_refund_amount = (paid_amount / reservation.total_cost) * refund_amount
        curr_user = AppUserProfile.objects.get(user_id=user_id)
        curr_user.balance += player_refund_amount
        curr_user.save()
    reservation.paid_users.clear()
    reservation.status = 'cancelled'
    reservation.save()

