document.addEventListener('DOMContentLoaded', function () {
    // Get the auth popup elements
    const authPopup = document.getElementById('authPopup');
    const authClose = document.querySelector('.auth-close');
    const loginBtn = document.getElementById('loginBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const passwordResetForm = document.getElementById('passwordResetForm');
    // Error Containers
    const loginMessageContainer = document.getElementById('loginErrorMessages');
    const registerMessageContainer = document.getElementById('registrationErrorMessages');
    const password_resetMessageContainer = document.getElementById('password-resetErrorMessages');

    // Password Reset Functionality

    const showForgotPassword = document.getElementById('showForgotPassword');
    const backToLogin = document.getElementById('backToLogin');
    const goToLogin = document.getElementById('goToLogin');
    const phoneForm = document.getElementById('phoneForm');
    const otpForm = document.getElementById('otpForm');
    const newPasswordForm = document.getElementById('newPasswordForm');

    // Function to show the auth popup
    window.showAuthPopup = function () {
        authPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Clear any previous error messages
        clearErrorMessages();
    };

    // Function to hide the auth popup
    window.hideAuthPopup = function () {
        authPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear any error messages when closing
        clearErrorMessages();
        
        // Reset all forms to their initial state
        if (loginForm) {
            loginForm.style.display = 'flex';
            loginForm.getElementsByTagName("form")[0].reset();
        }
        if (registerForm) {
            registerForm.style.display = 'none';
            registerForm.getElementsByTagName("form")[0].reset();
        }
        if (passwordResetForm) {
            passwordResetForm.style.display = 'none';
            // Reset all steps in password reset form
            document.getElementById('step1').style.display = 'flex';
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'none';
            document.getElementById('step4').style.display = 'none';
            // Reset all forms within password reset
            if (phoneForm) phoneForm.reset();
            if (otpForm) otpForm.reset();
            if (newPasswordForm) newPasswordForm.reset();
        }
        
        // Remove focus from login button if it exists
        if (loginBtn) {
            loginBtn.blur();
        }
    };

    // Close button event listener
    if (authClose) {
        authClose.addEventListener('click', hideAuthPopup);
    }

    // Close popup when clicking outside of it
    if (authPopup) {
        authPopup.addEventListener('click', function (event) {
            if (event.target === authPopup) {
                hideAuthPopup();
            }
        });
    }

    // Close popup when ESC key is pressed
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && authPopup.style.display === 'flex') {

            hideAuthPopup();
        }
    });

    // Open popup when login button is clicked
    if (loginBtn) {
        loginBtn.addEventListener('click', showAuthPopup);
    }

    // Switch to register form
    if (showRegister) {
        showRegister.addEventListener('click', function (e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'flex';
            // Clear error messages when switching forms
            clearErrorMessages();
        });
    }

    // Switch to login form
    if (showLogin) {
        showLogin.addEventListener('click', function (e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'flex';
            // Clear error messages when switching forms
            clearErrorMessages();
        });
    }

    // Show password reset form
    if (showForgotPassword) {
        showForgotPassword.addEventListener('click', function (e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'none';
            passwordResetForm.style.display = 'flex';
            clearErrorMessages();
        });
    }

    // Back to login form
    if (backToLogin) {
        backToLogin.addEventListener('click', function (e) {
            e.preventDefault();
            passwordResetForm.style.display = 'none';
            loginForm.style.display = 'flex';
            clearErrorMessages();
        });
    }

    // Go to log in after successful password reset
    if (goToLogin) {
        goToLogin.addEventListener('click', function () {
            passwordResetForm.style.display = 'none';
            loginForm.style.display = 'flex';
            clearErrorMessages();
        });
    }

    // Handle phone number submission
    if (phoneForm) {
        phoneForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                    },
                    body: formData,
                });

                const data = await response.json();
                if (data.success) {
                    document.getElementById('step1').style.display = 'none';
                    document.getElementById('step2').style.display = 'flex';
                    clearErrorMessages();
                } else {
                    displayAuthErrors(data.errors, "password-reset");
                }
            } catch (error) {
                displayAuthErrors(['Bir hata oluştu. Lütfen tekrar deneyin.']);
            }
        });
    }

    // Handle OTP verification
    if (otpForm) {
        otpForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                    },
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('step2').style.display = 'none';
                    document.getElementById('step3').style.display = 'flex';
                    clearErrorMessages();
                } else {
                    displayAuthErrors(data.errors, "password-reset");
                }
            } catch (error) {
                console.error('Error:', error);
                displayAuthErrors(['Bir hata oluştu. Lütfen tekrar deneyin.'], "password-reset");
            }
        });
    }

    // Handle new password submission
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newPassword = formData.get('new_password');
            const confirmPassword = formData.get('confirm_password');

            if (newPassword !== confirmPassword) {
                displayAuthErrors(['Şifreler eşleşmiyor.'], "password-reset");
                return;
            }

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                    },
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('step3').style.display = 'none';
                    document.getElementById('step4').style.display = 'flex';
                    clearErrorMessages();
                } else {
                    displayAuthErrors(data.errors, "password-reset");
                }
            } catch (error) {
                console.error('Error:', error);
                displayAuthErrors(['Bir hata oluştu. Lütfen tekrar deneyin.'], "password-reset");
            }
        });
    }

    // Function to display error messages
    window.displayAuthErrors = function (errors, error_type) {
        // Clear any previous error messages
        clearErrorMessages();

        // If there are no errors, return
        if (!errors || errors.length === 0) {
            return;
        }
        // Create a list to hold the error messages
        const errorList = document.createElement('ul');

        // Add each error to the list
        errors.forEach(function (error) {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });
        let errorMessageContainer;
        switch (error_type) {
            case "register":
                errorMessageContainer =  registerMessageContainer
                break
            case "login":
                errorMessageContainer = loginMessageContainer
                break
            case "password-reset":
                errorMessageContainer = password_resetMessageContainer
                break
        }
        // Add the list to the error messages container
        errorMessageContainer.appendChild(errorList);

        // Show the error messages container
        errorMessageContainer.classList.add('show');
    };
    // Function to clear error messages
    function clearErrorMessages() {
        let containers = [registerMessageContainer, loginMessageContainer, password_resetMessageContainer]
        for (let errorMessageContainer of containers) {
            errorMessageContainer.innerHTML = '';
            errorMessageContainer.classList.remove('show');
        }

    }
    
    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
                },
                body: formData,
            });

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                // ❌ Register failed — show errors
                const data = await response.json();
                clearErrorMessages();
                displayAuthErrors(data.errors, "register");
            } else if (response.redirected) {
                // ✅ Register succeeded and redirect was returned
                window.location.href = response.url;
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
                },
                body: formData,
            });

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                // ❌ Login failed — show errors
                const data = await response.json();
                clearErrorMessages();
                displayAuthErrors(data.errors, "login");
            } else if (response.redirected) {
                // ✅ Login succeeded and redirect was returned
                window.location.href = response.url;
            }
        });
    }
}); 