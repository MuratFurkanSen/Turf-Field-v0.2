from datetime import datetime, timedelta, time
from django.utils import timezone

from celery import shared_task

from field.models import ReservationHour, Field

@shared_task
def create_next_day_reservation_hours():
    today = datetime.today().date()

    # Loop through all fields
    for field in Field.objects.all():
        day_name = today.strftime("%a")
        for start_time in field.schedule_hours[day_name]:
            ReservationHour.objects.create(
                price=field.default_price,
                field=field,
                date=today if start_time >= 3 else today+timedelta(days=1),
                start_hour=time(hour=start_time),
            ).save()

@shared_task
def delete_past_reservation_hours():
    today = timezone.localdate()
    current_time = timezone.localtime().time()

    # Delete all past AvailableHours
    ReservationHour.objects.filter(date__lte=today, start_hour__lte=current_time).delete()
