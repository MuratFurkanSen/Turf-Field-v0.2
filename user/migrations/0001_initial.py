# Generated by Django 5.2.1 on 2025-05-12 20:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSkillSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sprint_speed', models.IntegerField(default=50)),
                ('attack_position', models.IntegerField(default=50)),
                ('finishing', models.IntegerField(default=50)),
                ('shot_power', models.IntegerField(default=50)),
                ('vision', models.IntegerField(default=50)),
                ('short_pass', models.IntegerField(default=50)),
                ('long_pass', models.IntegerField(default=50)),
                ('agility', models.IntegerField(default=50)),
                ('ball_control', models.IntegerField(default=50)),
                ('dribble', models.IntegerField(default=50)),
                ('def_awareness', models.IntegerField(default=50)),
                ('interceptions', models.IntegerField(default=50)),
                ('stamina', models.IntegerField(default=50)),
                ('strength', models.IntegerField(default=50)),
                ('aggression', models.IntegerField(default=50)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='skill_set', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('profile_picture', models.ImageField(default='app_user_profile_pics/Default User Profile.png', upload_to='app_user_profile_pics/')),
                ('full_name', models.CharField(max_length=50)),
                ('birth_date', models.DateField()),
                ('phone_number', models.CharField(max_length=50, unique=True)),
                ('wallet_balance', models.IntegerField(default=0)),
                ('position', models.CharField(blank=True, max_length=50)),
                ('friends', models.ManyToManyField(related_name='friends', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
                ('skills', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='skills', to='user.userskillset')),
            ],
        ),
    ]
