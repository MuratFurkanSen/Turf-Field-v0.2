from django.http import JsonResponse
from django.shortcuts import render, redirect

from facility.forms import FacilityCreationForm
from facility.models import Facility
from field.forms import FieldCreationForm
from field.models import Field
from user.models import VendorProfile


# Create your views here.
def facility_home(request):
    return render(request, 'facility_home.html')


def facility_profile(request):
    curr_user_profile = VendorProfile.objects.get(user_id=request.user.id)
    return render(request, 'facilityInfo.html', {'curr_user_profile': curr_user_profile})


def facility_calendar(request):
    return render(request, 'calendar.html')


def reports(request):
    return render(request, 'reports.html', {})


def facility_creation(request):
    if request.method == 'POST':
        form = FacilityCreationForm(request.POST, user=request.user)
        if form.is_valid():
            form.save()
            return redirect('/facility/fields')
    form = FacilityCreationForm()
    return render(request, 'facility_creation.html', {'form': form})


def facility_delete(request, pk):
    if request.method == 'POST':
        password = request.POST.get('password')
        if request.user.check_password(password):
            Facility.objects.get(pk=pk).delete()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': ['Hatalı Şifre Girdiniz']})
    return JsonResponse({'success': False, 'errors': ['Yanlış İşlem']})


def facility_edit(request, pk):
    return render(request, 'fields_dashboard.html')


def manage_facilities(request):
    form = FacilityCreationForm(user=request.user)
    facilities = Facility.objects.filter(belonged_vendor=request.user.profile)
    context = {'form': form, 'facilities': facilities}
    return render(request, 'facility_dashboard.html', context)


def field_dashboard(request, pk):
    facility = Facility.objects.get(pk=pk)
    owned_fields = Field.objects.filter(belonged_facility=facility)
    form = FieldCreationForm(facility=facility)
    context = {'fields': owned_fields, 'facility': facility, 'form': form}
    return render(request, 'fields_dashboard.html', context)


def field_creation(request, pk):
    if request.method == 'POST':
        if Facility.objects.get(pk=pk) not in Facility.objects.filter(belonged_vendor=request.user.profile):
            return JsonResponse({'success': False, 'errors': ['Fuck Off']})
        form = FieldCreationForm(request.POST, facility=Facility.objects.get(pk=pk))
        if form.is_valid():
            form.save()
            return redirect('/facility/fields/' + str(pk))
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False, 'errors': ['Yanlış İşlem']})

def field_edit(request, pk):
    return render(request, 'schedule.html')

def field_delete(request, pk):
    if request.method == 'POST':
        password = request.POST.get('password')
        if request.user.check_password(password):
            Field.objects.get(pk=pk).delete()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': ['Hatalı Şifre Girdiniz']})
    return JsonResponse({'success': False, 'errors': ['Yanlış İşlem']})