# Generated by Django 5.2.1 on 2025-06-06 07:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('team', '0002_alter_team_captain'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='losses',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='team',
            name='wins',
            field=models.IntegerField(default=0),
        ),
    ]
