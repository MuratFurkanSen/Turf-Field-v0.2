from datetime import datetime, time
from field.models import ReservationHour,Field
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = 'Clears old reservation hours and creates new ones for the day'

    def handle(self, *args, **kwargs):
        today = datetime.today().date()

        # Delete all past AvailableHours
        ReservationHour.objects.filter(date__lt=today).delete()

        # Loop through all facilities
        for field in Field.objects.all():
            day_name = today.strftime("%a")
            for start_time in field.schedule_hours[day_name]:
                ReservationHour.objects.create(
                    field=field,
                    date=today,
                    hour= time(hour=start_time),
                )
        self.stdout.write(self.style.SUCCESS("Successfully updated available hours"))
