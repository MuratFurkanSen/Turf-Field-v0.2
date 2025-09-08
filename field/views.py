import logging
import json

from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import render
from json import loads
from datetime import datetime, timedelta, time

from django.template.loader import render_to_string

from facility.models import Facility
from field.models import Field, ReservationHour
from reservation.models import Reservation
from team.models import Team


# Create your views here.
logger = logging.getLogger(__name__)

# Home Page Render
def fields_home(request):
    provinces = set(Facility.objects.values_list('province', flat=True))
    return render(request, 'fields_home.html', {'provinces': provinces})


# Dashboard for Facilities
def field_dashboard(request, pk):
    return render(request, 'fields_dashboard.html', {})


# Facility APIs
def send_schedule(request, pk):
    field = Field.objects.get(pk=pk)
    if field.belonged_facility.belonged_vendor != request.user.profile:
        return JsonResponse({'success': False, 'error': 'Fuck OFF'})
    return JsonResponse({'success': True, 'schedule': field.schedule_hours})


def send_facility_fields(request, pk):
    if Facility.objects.get(pk=pk).belonged_vendor != request.user.profile:
        return HttpResponseForbidden('Fuck Off')
    fields = Field.objects.filter(belonged_facility_id=pk)
    fields_list = []
    for field in fields:
        fields_list.append({
            'id': field.id,
            'name': field.name,
        })
    return JsonResponse({'success': True, 'fields': fields_list})


def save_schedule(request, pk):
    field = Field.objects.get(pk=pk)
    if field.belonged_facility.belonged_vendor != request.user.profile:
        return JsonResponse({'success': False, 'error': 'Fuck OFF'})
    data = loads(request.body.decode('utf-8'))
    for day in field.schedule_hours.keys():
        field.schedule_hours[day] = data[day]
    field.save()
    return JsonResponse({'success': True})


def send_calendar(request, pk):
    field = Field.objects.get(pk=pk)
    if field.belonged_facility.belonged_vendor != request.user.profile:
        return JsonResponse({'success': False, 'error': 'Fuck OFF'})
    data = loads(request.body.decode('utf-8'))
    start_date = data['start_date'].split('T')[0]
    start_date = datetime.strptime(start_date, '%Y-%m-%d')
    slots = field.reservation_hours.filter(date__gte=start_date, date__lte=start_date + timedelta(days=6))
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    calendar = {}
    current_date = start_date
    for day in days:
        day_slots = slots.filter(date=current_date)
        calendar[day] = []
        calendar[day].append([])
        for day_slot in day_slots:
            calendar[day][0].append(day_slot.start_hour.hour)
            calendar[day].append({
                'pk': day_slot.pk,
                'start_hour': day_slot.start_hour,
                'is_active': day_slot.is_active,
                'is_reserved': day_slot.is_reserved,
                'code': day_slot.code,
            })
        current_date += timedelta(days=1)
    if slots.exists():
        min_start_hour = min([slot.start_hour.hour for slot in slots], key=lambda x: x if x > 2 else x + 24)
        max_start_hour = max([slot.start_hour.hour for slot in slots], key=lambda x: x if x > 2 else x + 24)
    else:
        min_start_hour = 3
        max_start_hour = 2
    return JsonResponse({'success': True,
                         'min_start_hour': min_start_hour,
                         'max_start_hour': max_start_hour,
                         'calendar': calendar,
                         })


def update_calendar(request):
    data = loads(request.body.decode('utf-8'))
    field = Field.objects.get(pk=data['field_pk'])
    if field.belonged_facility.belonged_vendor != request.user.profile:
        return HttpResponseForbidden('Fuck OFF')

    slot = ReservationHour.objects.filter(pk=data['slot_pk'])
    if slot.exists():
        slot = slot.first()

        slot.is_active = data['is_active']
        slot.is_reserved = data['is_reserved']
        slot.code = data['code']
        slot.save()
        if not data['is_reserved']:
            booked_reservation = Reservation.objects.filter(date__exact=slot.date,start_hour__exact=slot.start_hour.hour,reserved_field=slot.field)
            if booked_reservation.exists():
                if booked_reservation.count() > 1:
                    logger.warning('Multiple Reservations Found that Related to Same Hour')
                else:
                    booked_reservation.first().delete()

    else:
        date = datetime.strptime(data['date'], '%Y-%m-%d')
        ReservationHour.objects.create(
            field=field,
            start_hour=time(hour=int(data['start_hour'])),
            date=date,
            is_active=data['is_active'],
            is_reserved=data['is_reserved'],
            code=data['code'],
        ).save()
    return JsonResponse({'success': True})


# User Fields Homepage APIs
def send_user_facilities(request):
    data = json.loads(request.body.decode('utf-8'))
    loc = data.get('location')
    if loc == 'all':
        facilities = Facility.objects.all()
    else:
        facilities = Facility.objects.filter(province=loc)

    if not facilities.exists():
        return JsonResponse({'success': False})
    html = render_to_string('particles/facility_card.html', {'facilities': facilities})
    return JsonResponse({'success': True, 'html': html})


def send_field_hours(request):
    data = json.loads(request.body.decode('utf-8'))
    pk = data.get('field_pk')
    selected_date = data.get('selected_date').split('T')[0]
    selected_date = datetime.strptime(selected_date, '%Y-%m-%d')

    field = Field.objects.filter(pk=pk)
    if not field.exists():
        return JsonResponse({'success': False})
    field = field.first()
    field_hours_data = field.reservation_hours.filter(date__exact=selected_date)
    field_hours = []
    for hour in field_hours_data:
        pk = hour.pk
        start_hour = str(hour.start_hour.hour).zfill(2)
        end_hour = str(hour.start_hour.hour + 1).zfill(2)
        field_hours.append((pk, f'{start_hour}.00-{end_hour}.00', hour.is_reserved))
    return JsonResponse({'success': True, 'field_hours': field_hours})


def send_team_options(request):
    teams_data = request.user.profile.teams.all()
    teams = []
    for team in teams_data:
        teams.append((team.pk, team.name))
    return JsonResponse({'success': True, 'teams': teams})
