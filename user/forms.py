from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.password_validation import validate_password
from .models import AppUserProfile, UserSkillSet, VendorProfile


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
            skills = UserSkillSet.objects.create()
            profile = AppUserProfile.objects.create(
                user=user,
                role='app_user',
                skills=skills,
                full_name=self.cleaned_data['full_name'],
                birth_date=self.cleaned_data['birth_date'],
                position=self.cleaned_data['position'],
                phone_number=self.cleaned_data['phone_number']
            )
            skills.user_profile = profile
            profile.save()
            skills.save()
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

class UserProfileUpdateForm(forms.ModelForm):
    email = forms.EmailField(required=True)
    current_password = forms.CharField(widget=forms.PasswordInput(), required=True)
    new_password = forms.CharField(widget=forms.PasswordInput(), required=False)
    confirm_password = forms.CharField(widget=forms.PasswordInput(), required=False)

    class Meta:
        model = AppUserProfile
        fields = ['profile_picture', 'phone_number']

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)  # You’ll pass this from your view
        super().__init__(*args, **kwargs)
        self.fields['profile_picture'].required = False

    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get('new_password')
        confirm_password = cleaned_data.get('confirm_password')

        if not self.user.check_password(cleaned_data.get('current_password')):
            raise forms.ValidationError("Hatalı Şifre Girdiniz")
        if new_password and new_password != confirm_password:
            raise forms.ValidationError("Yeni şifreler eşleşmiyor.")
        if new_password:
            validate_password(new_password)

        return cleaned_data

    def save(self, commit=True):
        profile = super().save(commit=False)
        user = self.user

        # Update email
        user.email = self.cleaned_data['email']

        # Change password if provided
        new_password = self.cleaned_data.get('new_password')
        if new_password:
            user.set_password(new_password)

        if commit:
            user.save()
            profile.user = user
            profile.save()

        return profile

class VendorRegistrationForm(UserCreationForm):
    username = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Kullanıcı Adı'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'placeholder': 'Email'}))
    full_name = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Ad Soyad'}))
    phone_number = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Telefon Numarası'}))
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'placeholder': 'Şifre'})
    )
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(attrs={'placeholder': 'Şifre Tekrar'})
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2',
                  'full_name' , 'phone_number']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            VendorProfile.objects.create(
                user=user,
                role='vendor',
                full_name=self.cleaned_data['full_name'],
                phone_number=self.cleaned_data['phone_number']
            )
        return user

class VendorProfileUpdateForm(forms.ModelForm):
    email = forms.EmailField(required=True)
    current_password = forms.CharField(widget=forms.PasswordInput(), required=True)
    new_password = forms.CharField(widget=forms.PasswordInput(), required=False)
    confirm_password = forms.CharField(widget=forms.PasswordInput(), required=False)

    class Meta:
        model = VendorProfile
        fields = ['profile_picture', 'phone_number']

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        self.fields['profile_picture'].required = False

    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get('new_password')
        confirm_password = cleaned_data.get('confirm_password')

        if not self.user.check_password(cleaned_data.get('current_password')):
            raise forms.ValidationError("Hatalı Şifre Girdiniz")
        if new_password and new_password != confirm_password:
            raise forms.ValidationError("Yeni şifreler eşleşmiyor.")
        if new_password:
            validate_password(new_password)

        return cleaned_data

    def save(self, commit=True):
        profile = super().save(commit=False)
        user = self.user

        # Update email
        user.email = self.cleaned_data['email']

        # Change password if provided
        new_password = self.cleaned_data.get('new_password')
        if new_password:
            user.set_password(new_password)

        if commit:
            user.save()
            profile.user = user
            profile.save()

        return profile