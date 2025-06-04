from datetime import datetime, time, timedelta
from field.models import ReservationHour,Field
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = 'Clears old reservation hours and creates new ones for the day'

    def handle(self, *args, **kwargs):
        today = datetime.today().date()

        # Delete all past AvailableHours
        ReservationHour.objects.filter(date__lt=today).delete()
        if ReservationHour.objects.last():
            next_day = ReservationHour.objects.last().date + timedelta(days=1)
            if next_day - today >= timedelta(days=14):
                self.stdout.write(self.style.NOTICE("Already Created Two Week Schedule"))
                return
        else:
            next_day = today

        # Loop through all facilities
        for field in Field.objects.all():
            day_name = today.strftime("%a")
            for start_time in field.schedule_hours[day_name]:
                ReservationHour.objects.create(
                    field=field,
                    date=next_day,
                    start_hour= time(hour=start_time),
                ).save()


        self.stdout.write(self.style.SUCCESS("Successfully updated available hours"))
