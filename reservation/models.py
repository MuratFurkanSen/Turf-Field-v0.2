from datetime import datetime
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from field.models import Field, ReservationHour
from team.models import Team
from user.models import AppUserProfile, Transaction


# Create your models here.

class Reservation(models.Model):
    PAYMENT_TIMEOUT = 600  # Seconds
    STATUS_CHOICES = (
        ('active', 'active'),
        ('payment', 'payment-pending'),
        ('past','completed'),
        ('on_hold', 'on-hold'),
        ('cancelled', 'cancelled'),
        ('timeout', 'payment-timeout'),
    )

    belonged_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, related_name='reservations')
    reserved_field = models.ForeignKey(Field, on_delete=models.CASCADE)
    hour_slot = models.ForeignKey(ReservationHour, on_delete=models.SET_NULL, null=True, related_name='reservations')

    creation_date = models.DateTimeField(auto_now_add=True)
    date = models.DateField()
    start_hour = models.IntegerField()

    remaining_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    ower_players = models.ManyToManyField(AppUserProfile, related_name='owed_reservations')
    paid_users = models.JSONField(default=dict, blank=True)

    review_pending_users = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def give_refund(self):
        for user_id,amount in self.paid_users.items():
            user = User.objects.get(pk=user_id)
            user.profile.wallet_balance += Decimal(amount)
            Transaction.objects.create(
                user_profile=user.profile,
                type='İade',
                amount=amount,
            )

@receiver(post_save, sender=Reservation)
def schedule_payment_timeout(sender, instance, created, **kwargs):
    if created:
        from .tasks import payment_timeout, reservation_start_time_arrival
        payment_timeout.apply_async((instance.id,), countdown=Reservation.PAYMENT_TIMEOUT)
        start_time = datetime(year=instance.date.year,
                              month=instance.date.month,
                              day=instance.date.day,
                              hour=instance.start_hour,)
        reservation_start_time_arrival.apply_async((instance.id,), eta=start_time)

