from django.db import models

from facility.models import Facility


# Create your models here.

class Field(models.Model):
    name = models.CharField(max_length=50)
    belonged_facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='fields')
    picture = models.ImageField(upload_to='field_pics', default='field_pics/Default Field Picture.png')
    schedule_hours = models.JSONField(default=dict)
    default_price = models.DecimalField(max_digits=10, decimal_places=2)

class ReservationHour(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='reservation_hours')
    date = models.DateField()
    start_hour = models.TimeField()
    is_reserved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    code = models.CharField(max_length=50, default='', blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
