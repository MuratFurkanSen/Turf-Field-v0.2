document.addEventListener('DOMContentLoaded', function () {
    // Get the auth popup elements
    const authPopup = document.getElementById('authPopup');
    const authClose = document.querySelector('.auth-close');
    const loginErrorMessages = document.getElementById('loginErrorMessages');
    const registerErrorMessages = document.getElementById('registerErrorMessages');
    const loginBtn = document.getElementById('loginBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

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

    // Function to display error messages
    window.displayAuthErrors = function (errors, formType = 'login') {
        // Clear any previous error messages
        clearErrorMessages();
        
        // If there are no errors, return
        if (!errors || errors.length === 0) {
            return;
        }
        
        // Determine which error container to use
        const errorContainer = formType === 'login' ? loginErrorMessages : registerErrorMessages;
        
        // Create a list to hold the error messages
        const errorList = document.createElement('ul');
        
        // Add each error to the list
        errors.forEach(function (error) {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });
        
        // Add the list to the error messages container
        errorContainer.appendChild(errorList);
        
        // Show the error messages container
        errorContainer.classList.add('show');
    };
    
    // Function to clear error messages
    function clearErrorMessages() {
        if (loginErrorMessages) {
            loginErrorMessages.innerHTML = '';
            loginErrorMessages.classList.remove('show');
        }
        if (registerErrorMessages) {
            registerErrorMessages.innerHTML = '';
            registerErrorMessages.classList.remove('show');
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
                displayAuthErrors(data.errors, 'register');
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
                displayAuthErrors(data.errors, 'login');
            } else if (response.redirected) {
                // ✅ Login succeeded and redirect was returned
                window.location.href = response.url;
            }
        });
    }

}); 