document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('walletForm');
    const cardNumber = document.getElementById('card_number');
    const expDate = document.getElementById('exp_date');
    const cvv = document.getElementById('cvv');
    const cardName = document.getElementById('card_name');
    const amount = document.getElementById('amount');
    const submitButton = form.querySelector('button[type="submit"]');
    const showTransactionHistoryBtn = document.getElementById('showTransactionHistory');
    const showLoadBalanceBtn = document.getElementById('showLoadBalance');
    const closeLoadBalanceBtn = document.getElementById('closeLoadBalance');
    const cancelLoadBalanceBtn = document.getElementById('cancelLoadBalance');
    const loadBalanceSection = document.querySelector('.load-balance-section');
    const errorMessagesContainer = document.getElementById('errorMessages');

    // Function to display error messages
    function displayErrors(errors) {
        // Clear any previous error messages
        clearErrors();

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
        errorMessagesContainer.appendChild(errorList);

        // Show the error messages container
        errorMessagesContainer.classList.add('show');
    }

    // Function to clear error messages
    function clearErrors() {
        if (errorMessagesContainer) {
            errorMessagesContainer.innerHTML = '';
            errorMessagesContainer.classList.remove('show');
        }
    }

    // Initialize Bootstrap Modal
    let transactionHistoryModal;
    try {
        const modalElement = document.getElementById('transactionHistoryModal');
        if (modalElement) {
            transactionHistoryModal = new bootstrap.Modal(modalElement);
        } else {
            console.error('Transaction history modal element not found');
        }
    } catch (error) {
        console.error('Error initializing Bootstrap modal:', error);
    }

    // Show transaction history modal
    if (showTransactionHistoryBtn && transactionHistoryModal) {
        showTransactionHistoryBtn.addEventListener('click', function () {
            try {
                transactionHistoryModal.show();
            } catch (error) {
                console.error('Error showing transaction history modal:', error);
            }
        });
    }

    // Show load balance section
    if (showLoadBalanceBtn && loadBalanceSection) {
        showLoadBalanceBtn.addEventListener('click', function () {
            loadBalanceSection.style.display = 'block';
            // Trigger reflow
            loadBalanceSection.offsetHeight;
            loadBalanceSection.classList.add('show');
            // Clear any previous errors when opening the form
            clearErrors();
        });
    }

    // Close load balance section
    function closeLoadBalance() {
        loadBalanceSection.classList.remove('show');
        setTimeout(() => {
            loadBalanceSection.style.display = 'none';
        }, 300); // Match the transition duration
        // Clear any errors when closing
        clearErrors();
    }

    if (closeLoadBalanceBtn) {
        closeLoadBalanceBtn.addEventListener('click', closeLoadBalance);
    }

    if (cancelLoadBalanceBtn) {
        cancelLoadBalanceBtn.addEventListener('click', closeLoadBalance);
    }

    // Format card number with spaces
    cardNumber.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue;
        validateCardNumber();
    });

    // Format expiry date
    expDate.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
        validateExpDate();
    });

    // Only allow numbers for CVV
    cvv.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '');
        validateCVV();
    });

    // Validate card holder name
    cardName.addEventListener('input', function () {
        validateCardName();
    });

    // Validate amount
    amount.addEventListener('input', function () {
        validateAmount();
    });

    function validateCardNumber() {
        const errorElement = document.getElementById('card_number_error');
        const value = cardNumber.value.replace(/\s/g, '');

        if (value.length < 16) {
            errorElement.textContent = 'Kart numarası 16 haneli olmalıdır';
            return false;
        }

        // Luhn algorithm for card validation
        let sum = 0;
        let isEven = false;

        for (let i = value.length - 1; i >= 0; i--) {
            let digit = parseInt(value[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        if (sum % 10 !== 0) {
            errorElement.textContent = 'Geçersiz kart numarası';
            return false;
        }

        errorElement.textContent = '';
        return true;
    }

    function validateExpDate() {
        const errorElement = document.getElementById('exp_date_error');
        const value = expDate.value;

        if (!value.match(/^\d{2}\/\d{2}$/)) {
            errorElement.textContent = 'Geçersiz tarih formatı (AA/YY)';
            return false;
        }

        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (month < 1 || month > 12) {
            errorElement.textContent = 'Geçersiz ay';
            return false;
        }

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            errorElement.textContent = 'Kart süresi dolmuş';
            return false;
        }

        errorElement.textContent = '';
        return true;
    }

    function validateCVV() {
        const errorElement = document.getElementById('cvv_error');
        const value = cvv.value;

        if (value.length !== 3) {
            errorElement.textContent = 'CVV 3 haneli olmalıdır';
            return false;
        }

        errorElement.textContent = '';
        return true;
    }

    function validateCardName() {
        const errorElement = document.getElementById('card_name_error');
        const value = cardName.value.trim();

        if (value.length < 3) {
            errorElement.textContent = 'Lütfen geçerli bir isim girin';
            return false;
        }

        if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value)) {
            errorElement.textContent = 'İsim sadece harflerden oluşmalıdır';
            return false;
        }

        errorElement.textContent = '';
        return true;
    }

    function validateAmount() {
        const errorElement = document.getElementById('amount_error');
        const value = parseFloat(amount.value);

        if (isNaN(value) || value <= 0) {
            errorElement.textContent = 'Lütfen geçerli bir miktar girin';
            return false;
        }

        if (value > 10000) {
            errorElement.textContent = 'Maksimum yükleme miktarı 10.000 TL\'dir';
            return false;
        }

        errorElement.textContent = '';
        return true;
    }

    function validateForm() {
        const isCardNumberValid = validateCardNumber();
        const isExpDateValid = validateExpDate();
        const isCVVValid = validateCVV();
        const isCardNameValid = validateCardName();
        const isAmountValid = validateAmount();

        return isCardNumberValid && isExpDateValid && isCVVValid && isCardNameValid && isAmountValid;
    }

    // Form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Clear any previous errors
        clearErrors();

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>İşleniyor...';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.errors) {
                    displayErrors(data.errors);
                }
            } else if (response.redirected) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error:', error);
            displayErrors(['Bir hata oluştu. Lütfen tekrar deneyin.']);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Bakiye Yükle';
        }
    });
});
