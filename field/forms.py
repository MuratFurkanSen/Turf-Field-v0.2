from django import forms

from field.models import Field


class FieldCreationForm(forms.ModelForm):
    class Meta:
        model = Field
        fields = ['name', 'picture', ]
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Saha İsmi'}),
        }

    def __init__(self, *args, **kwargs):
        self.facility = kwargs.pop('facility', None)
        super().__init__(*args, **kwargs)

    def save(self, commit=True):
        field = super().save(commit=False)
        field.belonged_facility = self.facility
        field.schedule_hours = \
            {
                'Mon': [16],
                'Tue': [],
                'Wed': [],
                'Thu': [],
                'Fri': [],
                'Sat': [],
                'Sun': [],
            }
        if commit:
            field.save()
