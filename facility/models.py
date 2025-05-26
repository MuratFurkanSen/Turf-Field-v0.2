from django.contrib.auth.models import User
from django.db import models

from user.models import VendorProfile


# Create your models here.
class Facility(models.Model):
    name = models.CharField(max_length=50)
    contact_phone_number = models.CharField(max_length=50)
    picture = models.ImageField(upload_to='facility_pics/', default=None, null=True, blank=True)
    open_location = models.CharField(max_length=50)
    maps_location = models.URLField()
    website = models.URLField()
    belonged_vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='vendor')
    rating = models.FloatField()
