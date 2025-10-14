from django.db import models

from user.models import AppUserProfile


# Create your models here.


class Team(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(AppUserProfile, related_name='teams')
    captain = models.ForeignKey(AppUserProfile, on_delete=models.PROTECT, related_name='captain')
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    member_positions = models.JSONField(default=dict)


class TeamJoinRequest(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'),
                      ('approved', 'Approved'),
                      ('rejected', 'Rejected')]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='incoming_requests')
    sender = models.ForeignKey(AppUserProfile, on_delete=models.CASCADE, related_name='sent_requests')
    status = models.CharField(max_length=20,choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)


class TeamInvite(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'),
                      ('accepted', 'Accepted'),
                      ('declined', 'Declined')]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='outgoing_invites')
    recipient = models.ForeignKey(AppUserProfile, on_delete=models.CASCADE, related_name='team_invites')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
