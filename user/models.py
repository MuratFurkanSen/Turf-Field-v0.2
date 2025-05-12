from django.contrib.auth.models import User
from django.db import models

# Create your models here.

SKILL_DEFAULT_VALUE = 50

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    skills = models.OneToOneField('UserSkillSet', on_delete=models.CASCADE, related_name='skills')
    profile_picture = models.ImageField(upload_to='profile_pics/', default='profile_pics/Default User Profile Male.png')
    full_name = models.CharField(max_length=50)
    birth_date = models.DateField()
    phone_number = models.CharField(max_length=50, unique=True)
    wallet_balance = models.IntegerField(default=0)
    friends = models.ManyToManyField(User, related_name='friends')
    position = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.id}| " + self.user.username

class UserSkillSet(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='skill_set', blank=True, null=True)
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

    # Heading Fields
    stamina = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    strength = models.IntegerField(default=SKILL_DEFAULT_VALUE)
    aggression = models.IntegerField(default=SKILL_DEFAULT_VALUE)

    @property
    def pace(self):
        return self.sprint_speed

    @property
    def shooting(self):
        skills = [self.attack_position, self.finishing, self.shot_power]
        return sum(skills) / len(skills)

    @property
    def passing(self):
        skills = [self.vision, self.short_pass, self.long_pass]
        return sum(skills) / len(skills)

    @property
    def dribbling(self):
        skills = [self.agility, self.ball_control, self.dribble]
        return sum(skills) / len(skills)

    @property
    def defense(self):
        skills = [self.def_awareness, self.interceptions]
        return sum(skills) / len(skills)

    @property
    def heading(self):
        skills = [self.stamina, self.strength, self.aggression]
        return sum(skills) / len(skills)