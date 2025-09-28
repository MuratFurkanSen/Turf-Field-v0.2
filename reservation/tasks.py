from reservation.models import Reservation
from field.models import ReservationHour
from celery import shared_task

@shared_task
def payment_timeout(reservation_id):
    reservation = Reservation.objects.get(pk=reservation_id)
    if reservation.status == 'payment':
        reservation.give_refund()
        reservation.paid_users.clear()
        reservation.ower_players.clear()
        reservation.status = 'timeout'
        slot = ReservationHour.objects.get(date__exact=reservation.date,start_hour__hour=reservation.start_hour )
        slot.is_reserved = False
        slot.save()
        reservation.save()