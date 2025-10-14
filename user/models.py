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
    phone_number = models.CharField(max_length=50)


class AppUserProfile(BaseProfile):
    birth_date = models.DateField()
    profile_picture = models.ImageField(upload_to='app_user_profile_pics/',
                                        default='app_user_profile_pics/Default User Profile Male.png')
    skills = models.OneToOneField('UserSkillSet', on_delete=models.CASCADE, related_name='profile', blank=True,
                                  null=True)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    friends = models.ManyToManyField(User, related_name='friends')
    position = models.CharField(max_length=50, blank=True)


class VendorProfile(BaseProfile):
    profile_picture = models.ImageField(upload_to='vendor_profile_pics/',
                                        default='vendor_profile_pics/Default Vendor Profile.png')
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)


class UserSkillSet(models.Model):
    voter_count = models.IntegerField(default=1)

    # Pace Fields
    acceleration = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    sprint_speed = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)

    # Shooting Fields
    attack_position = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    finishing = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    shot_power = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)

    # Passing Fields
    vision = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    short_pass = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    long_pass = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)

    # Dribbling Fields
    agility = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    ball_control = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    dribble = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)

    # Defense Fields
    def_awareness = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    interceptions = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)

    # Physics Fields
    stamina = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)
    strength = models.DecimalField(max_digits=5, decimal_places=2, default=SKILL_DEFAULT_VALUE)

    @property
    def pace(self):
        skills = [self.acceleration, self.sprint_speed]
        return int(sum(skills) / len(skills))

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
        skills = [self.stamina, self.strength]
        return int(sum(skills) / len(skills))

    def update_values(self, skills):
        for skill, value in skills.items():
            match skill:
                case 'acceleration':
                    self.acceleration = self.calculate_new_skill_value(self.acceleration, value)
                case 'sprint_speed':
                    self.sprint_speed = self.calculate_new_skill_value(self.sprint_speed, value)
                case 'attack_position':
                    self.attack_position = self.calculate_new_skill_value(self.attack_position, value)
                case 'finishing':
                    self.finishing = self.calculate_new_skill_value(self.finishing, value)
                case 'shot_power':
                    self.shot_power = self.calculate_new_skill_value(self.shot_power, value)
                case 'vision':
                    self.vision = self.calculate_new_skill_value(self.vision, value)
                case 'short_pass':
                    self.short_pass = self.calculate_new_skill_value(self.short_pass, value)
                case 'long_pass':
                    self.long_pass = self.calculate_new_skill_value(self.long_pass, value)
                case 'agility':
                    self.agility = self.calculate_new_skill_value(self.agility, value)
                case 'ball_control':
                    self.ball_control = self.calculate_new_skill_value(self.ball_control, value)
                case 'dribble':
                    self.dribble = self.calculate_new_skill_value(self.dribble, value)
                case 'def_awareness':
                    self.def_awareness = self.calculate_new_skill_value(self.def_awareness, value)
                case 'interceptions':
                    self.interceptions = self.calculate_new_skill_value(self.interceptions, value)
                case 'stamina':
                    self.stamina = self.calculate_new_skill_value(self.stamina, value)
                case 'strength':
                    self.strength = self.calculate_new_skill_value(self.strength, value)
                case _:
                    raise KeyError
            self.voter_count += 1

    def calculate_new_skill_value(self, old_values, new_value):
        return ((old_values * self.voter_count) + new_value) / (self.voter_count + 1)


class Transaction(models.Model):
    user_profile = models.ForeignKey(AppUserProfile, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
