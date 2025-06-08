from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Team

@receiver(m2m_changed, sender=Team.members.through)
def members_changed(sender,instance,action, **kwargs):
    for pk in kwargs['pk_set']:
        if action == 'post_add':
            instance.member_positions[pk] = {
                'top':0,
                'left':0,
                'color': ""
            }
        elif action == 'post_remove':
            instance.member_positions.pop(pk)
    instance.save()
