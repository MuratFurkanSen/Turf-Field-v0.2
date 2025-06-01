document.addEventListener('DOMContentLoaded', function () {
    // Get the facility popup elements
    const facilityPopup = document.getElementById('facilityPopup');
    const facilityClose = document.querySelector('#facilityPopup .auth-close');
    const facilityForm = document.getElementById('facilityForm');
    const facilityMessageContainer = document.getElementById('facilityErrorMessages');

    // Function to show the facility popup
    window.showFacilityPopup = function () {
        facilityPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Clear any previous error messages
        clearErrorMessages();
    };

    // Function to hide the facility popup
    window.hideFacilityPopup = function () {
        facilityPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Clear any error messages when closing
        clearErrorMessages();
        // Reset the form
        if (facilityForm) {
            facilityForm.getElementsByTagName("form")[0].reset();
        }
    };

    // Close button event listener
    if (facilityClose) {
        facilityClose.addEventListener('click', hideFacilityPopup);
    }

    // Close popup when clicking outside of it
    if (facilityPopup) {
        facilityPopup.addEventListener('click', function (event) {
            if (event.target === facilityPopup) {
                hideFacilityPopup();
            }
        });
    }

    // Close popup when ESC key is pressed
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && facilityPopup.style.display === 'flex') {
            hideFacilityPopup();
        }
    });

    // Function to display error messages
    window.displayFacilityErrors = function (errors) {
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
        facilityMessageContainer.appendChild(errorList);

        // Show the error messages container
        facilityMessageContainer.classList.add('show');
    };

    // Function to clear error messages
    function clearErrorMessages() {
        if (facilityMessageContainer) {
            facilityMessageContainer.innerHTML = '';
            facilityMessageContainer.classList.remove('show');
        }
    }

    // Handle facility form submission
    if (facilityForm) {
        facilityForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

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
                    // ❌ Facility creation failed — show errors
                    const data = await response.json();
                    clearErrorMessages();
                    displayFacilityErrors(data.errors);
                } else if (response.redirected) {
                    // ✅ Facility creation succeeded and redirect was returned
                    window.location.href = response.url;
                }
            } catch (error) {
                console.error('Error:', error);
                displayFacilityErrors(['Bir hata oluştu. Lütfen tekrar deneyin.']);
            }
        });
    }
});
