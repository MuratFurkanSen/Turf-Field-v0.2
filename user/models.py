from django.contrib.auth.models import User
from django.db import models

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=50)
    birth_date = models.DateField()
    phone_number = models.CharField(max_length=50, unique=True)
    wallet_balance = models.IntegerField(default=0)
    friends = models.ManyToManyField(User, related_name='friends')
    position = models.CharField(max_length=50, blank=True)
    temp_otp = models.IntegerField(blank=True, default=-1)

    def __str__(self):
        return f"{self.id}| " + self.user.username