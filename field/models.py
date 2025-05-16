from django.db import models

from facility.models import Facility


# Create your models here.

class Fields(models.Model):
    name = models.CharField(max_length=50)
    belonged_facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='facility')


class Schedule(models.Model):
    pass