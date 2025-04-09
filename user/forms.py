from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import UserProfile


class UserRegistrationForm(UserCreationForm):
    position_choices = (
        ('None', 'Favori Pozisyon'),
        ('X', 'Ne olsa oynarız abi'),
        ("GK", 'Kaleci'),
        ("CB", 'Defans'),
        ("CM", 'Orta Saha'),
        ("CF", 'Forvet')
    )
    username = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Kullanıcı Adı'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'placeholder': 'Email'}))
    full_name = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Ad Soyad'}))
    birth_date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    position = forms.ChoiceField(choices=position_choices, required=True,
                                 widget=forms.Select(attrs={'class': 'signInput', 'placeholder': 'Pozi'}))
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'placeholder': 'Şifre'})
    )
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(attrs={'placeholder': 'Şifre Tekrar'})
    )
    phone_number = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Telefon Numarası'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2',
                  'full_name', 'birth_date', 'position', 'phone_number']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            UserProfile.objects.create(
                user=user,
                full_name=self.cleaned_data['full_name'],
                birth_date=self.cleaned_data['birth_date'],
                position=self.cleaned_data['position'],
                phone_number=self.cleaned_data['phone_number']
            )
        return user

class UserLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'placeholder': 'Kullanıcı Adı'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Şifre'})
    )
    class Meta:
        model = User
        fields = ('username', 'password')
