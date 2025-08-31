from django import forms
from facility.models import Facility


class FacilityCreationForm(forms.ModelForm):
    class Meta:
        model = Facility
        fields = ['name', 'contact_phone_number', 'picture', 'open_location', 'maps_location', 'website']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'İşletme İsmi'}),
            'description': forms.TextInput(attrs={'placeholder': 'İşletme Açıklaması'}),
            'contact_phone_number': forms.TextInput(attrs={'placeholder': 'İletişim Numarası'}),
            'open_location': forms.TextInput(attrs={'placeholder': 'Açık adres'}),
            'maps_location': forms.URLInput(attrs={'placeholder': 'Google Maps Linkini Girin'}),
            'website': forms.URLInput(attrs={'placeholder': 'Website Linkini Buraya Girebilirsiniz', 'required': False}),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)  # You’ll pass this from your view
        super().__init__(*args, **kwargs)

    def save(self, commit=True):
        facility = super().save(commit=False)
        facility.belonged_vendor = self.user.profile
        if commit:
            facility.save()


