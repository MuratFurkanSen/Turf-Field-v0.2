# Generated by Django 5.2.1 on 2025-06-01 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('field', '0004_alter_field_schedule_hours'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservationhour',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
