from django.contrib.auth.models import User
from polymorphic.models import PolymorphicModel
from django.db import models

# Create your models here.

SKILL_DEFAULT_VALUE = 50


class BaseProfile(PolymorphicModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    ROLE_CHOICES = (
        ('app_user', 'App User'),
        ('vendor', 'Vendor'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=50, unique=True)


class AppUserProfile(BaseProfile):
    birth_date = models.DateField()
    profile_picture = models.ImageField(upload_to='app_user_profile_pics/',
                                        default='app_user_profile_pics/Default User Profile Male.png')
    skills = models.OneToOneField('UserSkillSet', on_delete=models.CASCADE, related_name='skills')
    wallet_balance = models.IntegerField(default=0)
    friends = models.ManyToManyField(User, related_name='friends')
    position = models.CharField(max_length=50, blank=True)


class VendorProfile(BaseProfile):
    profile_picture = models.ImageField(upload_to='vendor_profile_pics/',
                                        default='vendor_profile_pics/Default Vendor Profile.png')


class UserSkillSet(models.Model):
    user_profile = models.OneToOneField(AppUserProfile, on_delete=models.CASCADE, related_name='skill_set', blank=True,
                                        null=True)
    # Pace Fields
    sprint_speed = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    # Shooting Fields
    attack_position = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    finishing = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    shot_power = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    # Passing Fields
    vision = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    short_pass = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    long_pass = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    # Dribbling Fields
    agility = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    ball_control = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    dribble = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    # Defense Fields
    def_awareness = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    interceptions = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    # Physics Fields
    stamina = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    strength = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    aggression = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    @property
    def pace(self):
        return self.sprint_speed

    @property
    def shooting(self):
        skills = [self.attack_position, self.finishing, self.shot_power]
        return int(sum(skills) / len(skills))

    @property
    def passing(self):
        skills = [self.vision, self.short_pass, self.long_pass]
        return int(sum(skills) / len(skills))

    @property
    def dribbling(self):
        skills = [self.agility, self.ball_control, self.dribble]
        return int(sum(skills) / len(skills))

    @property
    def defense(self):
        skills = [self.def_awareness, self.interceptions]
        return int(sum(skills) / len(skills))

    @property
    def physics(self):
        skills = [self.stamina, self.strength, self.aggression]
        return int(sum(skills) / len(skills))


class Transaction(models.Model):
    user_profile = models.ForeignKey(AppUserProfile, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20)
    amount = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
