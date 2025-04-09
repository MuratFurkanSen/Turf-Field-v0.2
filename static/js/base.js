// Kartım popup işlemleri
document.addEventListener('DOMContentLoaded', function () {
    const kartimLink = document.querySelector('.nav-menu ul li:first-child a');
    const kartimPopup = document.getElementById('kartimPopup');
    const kartimClose = document.querySelector('.kartim-close');

    // Ensure popup is closed by default
    if (kartimPopup) {
        kartimPopup.style.display = 'none';
    }

    // Kartım linkine tıklandığında
    if (kartimLink) {
        kartimLink.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (kartimPopup) {
                kartimPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Çarpı işaretine tıklandığında
    if (kartimClose) {
        kartimClose.addEventListener('click', function () {
            if (kartimPopup) {
                kartimPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Popup dışına tıklandığında
    if (kartimPopup) {
        kartimPopup.addEventListener('click', function (e) {
            if (e.target === kartimPopup) {
                kartimPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Auth Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const authPopup = document.getElementById('authPopup');
    const authClose = document.querySelector('.auth-close');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Function to close popup and blur login button
    function closeAuthPopup() {
        authPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        loginBtn.blur(); // Remove focus from login button
    }

    // Open popup when login button is clicked
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            authPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close popup when close button is clicked
    if (authClose) {
        authClose.addEventListener('click', closeAuthPopup);
    }

    // Close popup when clicking outside the popup content
    if (authPopup) {
        authPopup.addEventListener('click', function(e) {
            if (e.target === authPopup) {
                closeAuthPopup();
            }
        });
    }

    // Close popup when ESC key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && authPopup.style.display === 'flex') {
            closeAuthPopup();
        }
    });

    // Switch to register form
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'flex';
        });
    }

    // Switch to login form
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'flex';
        });
    }
});

// User Dropdown Functionality
document.addEventListener('DOMContentLoaded', function() {
    const userDropdown = document.querySelector('.user-dropdown');
    const userDropdownBtn = document.querySelector('.user-dropdown-btn');
    const userDropdownContent = document.querySelector('.user-dropdown-content');
    
    if (userDropdownBtn && userDropdownContent) {
        // Toggle dropdown on button click
        userDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdownContent.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target)) {
                userDropdownContent.classList.remove('show');
            }
        });
        
        // Close dropdown when pressing ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                userDropdownContent.classList.remove('show');
            }
        });
    }
}); 