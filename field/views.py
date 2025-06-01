from django.http import JsonResponse
from django.shortcuts import render
from json import loads

from field.models import Field


# Create your views here.
def fields(request):
    return render(request, 'fields.html', {})

def field_dashboard(request, pk):
    return render(request, 'fields_dashboard.html', {})

def send_schedule(request,pk):
    field = Field.objects.get(pk=pk)
    if field.belonged_facility.belonged_vendor != request.user.profile:
        return JsonResponse({'success': False,'error':'Fuck OFF'})
    return JsonResponse({'success': True, 'schedule': field.schedule_hours})

def save_schedule(request, pk):
    field = Field.objects.get(pk=pk)
    if field.belonged_facility.belonged_vendor != request.user.profile:
        return JsonResponse({'success': False,'error':'Fuck OFF'})
    data = loads(request.body.decode('utf-8'))
    for day in field.schedule_hours.keys():
        field.schedule_hours[day] = data[day]
    field.save()
    return JsonResponse({'success': True})


