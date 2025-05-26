from django.shortcuts import render

from user.models import VendorProfile


# Create your views here.
def facility_home(request):
    return render(request, 'facility_home.html')

def facility_profile(request):
    curr_user_profile = VendorProfile.objects.get(user_id=request.user.id)
    return render(request, 'facilityInfo.html', {'curr_user_profile': curr_user_profile})


def update_vendor_info(request):
    return None