from django.db import models

from field.models import Field, ReservationHour
from team.models import Team
from user.models import AppUserProfile


# Create your models here.

class Reservation(models.Model):
    STATUS_CHOICES = (
        ('active', 'active'),   
        ('payment', 'pending payment'),
        ('on_hold', 'on hold'),
        ('canceled', 'canceled'),
        ('review', 'review'),
        ('past','past')
    )
    date = models.DateField()
    start_hour = models.IntegerField()
    belonged_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True)
    reserved_field = models.ForeignKey(Field, on_delete=models.CASCADE)
    total_cost = models.IntegerField()
    remaining_cost = models.IntegerField()
    ower_players = models.ManyToManyField(AppUserProfile, related_name='owed_reservations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

