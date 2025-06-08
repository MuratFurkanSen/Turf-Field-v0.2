document.addEventListener('DOMContentLoaded', function () {
    // Get delete confirmation popup elements
    const deletePopup = document.getElementById('deleteConfirmationPopup');
    const deleteClose = deletePopup.querySelector('.auth-close');
    const deleteForm = document.getElementById('deleteConfirmationForm');
    const deleteErrorMessages = document.getElementById('deleteErrorMessages');
    let currentDeleteUrl = '';

    // Get field creation popup elements
    const fieldPopup = document.getElementById('fieldPopup');
    const fieldClose = document.querySelector('.auth-close');
    const fieldForm = document.getElementById('fieldCreationForm');
    const fieldErrorMessages = document.getElementById('fieldErrorMessages');

    // Function to show field creation popup
    window.showFieldPopup = function () {
        fieldPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        clearFieldErrors();
    };

    // Function to hide field creation popup
    window.hideFieldPopup = function () {
        fieldPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        fieldForm.reset();
        clearFieldErrors();
    };

    // Close button event listener for field popup
    if (fieldClose) {
        fieldClose.addEventListener('click', hideFieldPopup);
    }

    // Close field popup when clicking outside
    if (fieldPopup) {
        fieldPopup.addEventListener('click', function (event) {
            if (event.target === fieldPopup) {
                hideFieldPopup();
            }
        });
    }

    // Close field popup when ESC key is pressed
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && fieldPopup.style.display === 'flex') {
            hideFieldPopup();
        }
    });

    // Handle field form submission
    if (fieldForm) {
        fieldForm.addEventListener('submit', async function (e) {
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
                    window.location.reload();
                } else {
                    displayFieldErrors(data.errors);
                }
            } catch (error) {
                displayFieldErrors(['Bir hata oluştu. Lütfen tekrar deneyin.']);
            }
        });
    }

    // Function to display field error messages
    function displayFieldErrors(errors) {
        clearFieldErrors();
        if (!errors || errors.length === 0) return;

        const errorList = document.createElement('ul');
        errors.forEach(function (error) {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });

        fieldErrorMessages.appendChild(errorList);
        fieldErrorMessages.classList.add('show');
    }

    // Function to clear field error messages
    function clearFieldErrors() {
        if (fieldErrorMessages) {
            fieldErrorMessages.innerHTML = '';
            fieldErrorMessages.classList.remove('show');
        }
    }

    // Function to show delete confirmation popup
    window.showDeleteConfirmation = function (id, name, type) {
        const nameElement = document.getElementById('facilityNameToDelete');
        const popupTitle = document.querySelector('#deleteConfirmationPopup .auth-form h2');
        const confirmMessage = document.querySelector('#deleteConfirmationPopup .confirmation-message p:first-child');
        const submitButton = document.querySelector('#deleteConfirmationPopup .auth-submit.delete');
        
        nameElement.textContent = name;
        currentDeleteUrl = type === 'facility' ? `/facility/delete/${id}/` : `/facility/field/delete/${id}/`;
        
        // Update popup content based on type
        if (type === 'facility') {
            popupTitle.textContent = 'İşletme Silme Onayı';
            confirmMessage.innerHTML = `<strong><span id="facilityNameToDelete">${name}</span></strong> işletmesini silmek istediğinizden emin misiniz?`;
            submitButton.textContent = 'İşletmeyi Sil';
        } else {
            popupTitle.textContent = 'Saha Silme Onayı';
            confirmMessage.innerHTML = `<strong><span id="facilityNameToDelete">${name}</span></strong> sahasını silmek istediğinizden emin misiniz?`;
            submitButton.textContent = 'Sahayı Sil';
        }
        
        deleteForm.action = currentDeleteUrl;
        deletePopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        clearDeleteErrors();
    };

    // Function to hide delete confirmation popup
    window.hideDeleteConfirmation = function () {
        deletePopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        deleteForm.reset();
        clearDeleteErrors();
    };

    // Close button event listener
    if (deleteClose) {
        deleteClose.addEventListener('click', hideDeleteConfirmation);
    }

    // Close popup when clicking outside
    if (deletePopup) {
        deletePopup.addEventListener('click', function (event) {
            if (event.target === deletePopup) {
                hideDeleteConfirmation();
            }
        });
    }

    // Close popup when ESC key is pressed
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && deletePopup.style.display === 'flex') {
            hideDeleteConfirmation();
        }
    });

    // Handle delete buttons for both facilities and fields
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const id = this.dataset.facilityId || this.dataset.fieldId;
            const name = this.dataset.facilityName || this.dataset.fieldName;
            const type = this.dataset.facilityId ? 'facility' : 'field';
            showDeleteConfirmation(id, name, type);
        });
    });

    // Handle delete form submission
    if (deleteForm) {
        deleteForm.addEventListener('submit', async function (e) {
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
                    window.location.reload();
                } else {
                    displayDeleteErrors(data.errors);
                }
            } catch (error) {
                displayDeleteErrors(['Bir hata oluştu. Lütfen tekrar deneyin.']);
            }
        });
    }

    // Function to display delete error messages
    function displayDeleteErrors(errors) {
        clearDeleteErrors();
        if (!errors || errors.length === 0) return;

        const errorList = document.createElement('ul');
        errors.forEach(function (error) {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });

        deleteErrorMessages.appendChild(errorList);
        deleteErrorMessages.classList.add('show');
    }

    // Function to clear delete error messages
    function clearDeleteErrors() {
        if (deleteErrorMessages) {
            deleteErrorMessages.innerHTML = '';
            deleteErrorMessages.classList.remove('show');
        }
    }

    // Handle facility card hover effects
    const facilityCards = document.querySelectorAll('.facility-card:not(.create-card)');
    facilityCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
    });

    // Handle create card hover effect
    const createCard = document.querySelector('.create-card');
    if (createCard) {
        createCard.addEventListener('click', function (e) {
            // Prevent event bubbling issues
            e.preventDefault();
            e.stopPropagation();
            showFieldPopup();
        });

        createCard.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f0f0f0';
            this.style.borderColor = '#218838';
        });

        createCard.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '#f8f9fa';
            this.style.borderColor = '#28a745';
        });
    }
});
