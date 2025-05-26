document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const saveButton = document.querySelector('button[type="submit"]');
    const errorMessageContainer = document.querySelector('#errorMessages');
    const initialFormData = new FormData(form);
    const logoInput = document.getElementById('facility_logo');
    const logoPreview = document.getElementById('logoPreview');
    
    // Set initial button state
    saveButton.disabled = true;
    
    // Handle logo preview
    logoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                logoPreview.src = e.target.result;
                saveButton.disabled = !hasFormChanged();
            };
            reader.readAsDataURL(file);
        }
    });

    // Function to check if form has changed
    function hasFormChanged() {
        const currentFormData = new FormData(form);
        
        for (let [key, value] of currentFormData.entries()) {
            if (key === 'csrfmiddlewaretoken') continue;
            
            if (key === 'logo') {
                const fileInput = document.getElementById('facility_logo');
                if (fileInput.files.length > 0) return true;
                continue;
            }
            
            const initialValue = initialFormData.get(key);
            if (initialValue !== value) return true;
        }
        
        return false;
    }
    
    // Add change event listeners to all form inputs
    const formInputs = form.querySelectorAll('input:not([disabled]), select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', function () {
            saveButton.disabled = !hasFormChanged();
        });
        
        if (input.type === 'text' || input.type === 'email' || input.type === 'tel') {
            input.addEventListener('input', function () {
                saveButton.disabled = !hasFormChanged();
            });
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(form);

        // Show loading state
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Kaydediliyor...';

        try {
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
                // ❌ Update failed — show errors
                const data = await response.json();
                clearErrorMessages();
                displayErrors(data.errors);
                // Reset button state
                saveButton.disabled = !hasFormChanged();
                saveButton.innerHTML = 'Değişiklikleri Kaydet';
            } else if (response.redirected) {
                // ✅ Update succeeded and redirect was returned
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error:', error);
            clearErrorMessages();
            displayErrors(['Bir hata oluştu. Lütfen tekrar deneyin.']);
            saveButton.disabled = !hasFormChanged();
            saveButton.innerHTML = 'Değişiklikleri Kaydet';
        }
    });

    window.displayErrors = function (errors) {
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
        // Add the list to the error messages container
        errorMessageContainer.appendChild(errorList);

        // Show the error messages container
        errorMessageContainer.classList.add('show');
    };

    // Function to clear error messages
    function clearErrorMessages() {
        errorMessageContainer.innerHTML = '';
        errorMessageContainer.classList.remove('show');
    }
});
