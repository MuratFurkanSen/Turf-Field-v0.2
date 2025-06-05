// Kartım popup işlemleri
document.addEventListener('DOMContentLoaded', function () {
    const kartimPopup = document.getElementById('kartimPopup');
    const kartimClose = document.querySelector('.kartim-close');

    // Ensure popup is closed by default
    if (kartimPopup) {
        kartimPopup.style.display = 'none';
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