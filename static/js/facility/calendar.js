// Global variables
let monday;
let fieldId;

// Get CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Update Slot
function updateSlot(button, is_reserved, is_active, customerInfo, slot_date, slot_hour) {
    let localDate;
    if (slot_date !== -1) {
        const year = slot_date.getFullYear();
        const month = String(slot_date.getMonth() + 1).padStart(2, '0');
        const day = String(slot_date.getDate()).padStart(2, '0');

        localDate = `${year}-${month}-${day}`;
    }
    fetch('/field/set/calendar/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            field_pk: fieldId,
            slot_pk: button.parentElement.dataset.pk ?? -1,
            is_reserved: is_reserved,
            is_active: is_active,
            code: customerInfo,
            date: slot_date === -1 ? -1 : localDate,
            start_hour: slot_hour,


        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return true;
                // You might want to update the button state or show a success message
            } else {
                alert('Rezervasyon onaylanırken bir hata oluştu: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error confirming phone booking:', error);
            alert('Rezervasyon onaylanırken bir hata oluştu.');
        });
}

// Tarihleri güncelle
function updateDates(monday) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateText = `${date.getDate()} ${months[date.getMonth()]}`;
        document.getElementById(`${days[i]}-date`).textContent = dateText;
    }
}

// Tesisleri yükle
function loadFacilities() {
    fetch('/facility/get/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            const facilitySelect = document.getElementById('facilitySelect');
            facilitySelect.innerHTML = '<option value="">Tesis Seçin</option>';

            data['facilities'].forEach(facility => {
                const option = document.createElement('option');
                option.value = facility.id;
                option.textContent = facility.name;
                facilitySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading facilities:', error));
}

// Sahaları yükle
function loadFields(facilityId) {
    const fieldSelect = document.getElementById('fieldSelect');
    fieldSelect.disabled = true;
    fieldSelect.innerHTML = '<option value="">Sahalar Yükleniyor...</option>';

    fetch(`/field/get/${facilityId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            fieldSelect.innerHTML = '<option value="">Saha Seçin</option>';

            data['fields'].forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = field.name;
                fieldSelect.appendChild(option);
            });

            fieldSelect.disabled = false;
        })
        .catch(error => {
            console.error('Error loading fields:', error);
            fieldSelect.innerHTML = '<option value="">Sahalar yüklenirken hata oluştu</option>';
        });
}

// Saat dilimlerini güncelle
function updateTimeSlots(fieldId, monday) {
    // Mevcut saat dilimlerini temizle
    const timeSlots = document.getElementById('timeSlots');
    timeSlots.innerHTML = '';
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');

    const local_monday = `${year}-${month}-${day}`;
    // Yeni saat dilimlerini oluştur
    fetch(`/field/get/calendar/${fieldId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({'start_date': local_monday})
    })
        .then(response => response.json())
        .then(data => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const calendar = data['calendar']
            for (let hour = data['min_start_hour']; hour <= data['max_start_hour'] + 24; hour++) {
                const displayHour = hour % 24;
                const row = document.createElement('tr');
                const timeCell = document.createElement('td');
                timeCell.textContent = `${String(displayHour).padStart(2, '0')}:00 - ${String(displayHour + 1).padStart(2, '0')}:00`;
                row.appendChild(timeCell);

                days.forEach((day) => {
                    const cell = document.createElement('td');
                    const container = document.createElement('div');
                    container.className = 'time-slot-container';
                    // Determine State of Button
                    // Slot Not Exist
                    let status;
                    let content;
                    let code;
                    if (!calendar[day][0].includes(displayHour)) {
                        status = 'closed';
                        content = 'Kapalı';
                    } else { // Slot Exists
                        let index = calendar[day][0].indexOf(displayHour) + 1
                        let slot = calendar[day][index];
                        if (!slot['is_active']) {
                            status = 'closed';
                            content = 'Kapalı';
                        } else {
                            if (slot['is_reserved']) {
                                status = 'booked';
                                content = 'Dolu';
                                code = slot['code'];
                            } else {
                                status = 'available';
                                content = 'Müsait';
                            }
                        }
                        container.setAttribute('data-pk', slot['pk']);
                    }

                    const button = document.createElement('button');
                    button.className = `btn btn-sm time-slot ${status}`;
                    button.textContent = content;
                    button.onclick = function () {
                        showControlButtons(this);
                    };

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control form-control-sm reservation-code-input';
                    input.placeholder = 'Rezervasyon Kodu';
                    if (code) {
                        input.value = code;
                        input.classList.add('show');
                    }

                    const controlButtons = document.createElement('div');
                    controlButtons.className = 'control-buttons';

                    const phoneBookBtn = document.createElement('button');
                    phoneBookBtn.className = 'btn btn-sm btn-warning';
                    phoneBookBtn.textContent = 'Telefonla Rezervasyon';
                    phoneBookBtn.onclick = function (e) {
                        e.stopPropagation();
                        markAsPhoneBooked(button, input);
                    };

                    const closeTimeBtn = document.createElement('button');
                    closeTimeBtn.className = 'btn btn-sm btn-secondary';
                    closeTimeBtn.textContent = 'Saati Kapat';
                    closeTimeBtn.onclick = function (e) {
                        e.stopPropagation();
                        closeTimeSlot(button, input);
                    };

                    const activateBtn = document.createElement('button');
                    activateBtn.className = 'btn btn-sm btn-success';
                    activateBtn.textContent = 'Aktif Et';
                    activateBtn.onclick = function (e) {
                        e.stopPropagation();
                        activateTimeSlot(button, input);
                    };

                    controlButtons.appendChild(phoneBookBtn);
                    controlButtons.appendChild(closeTimeBtn);
                    controlButtons.appendChild(activateBtn);

                    container.appendChild(button);
                    container.appendChild(input);
                    container.appendChild(controlButtons);
                    cell.appendChild(container);
                    row.appendChild(cell);
                });

                timeSlots.appendChild(row);
            }
        })
        .catch(error => console.error('Error loading calendar:', error));
}

// Kontrol butonlarını göster
function showControlButtons(button) {
    const container = button.parentElement;
    const controlButtons = container.querySelector('.control-buttons');
    const activateBtn = controlButtons.querySelector('.btn-success');


    // Eğer butonlar zaten görünüyorsa, gizle
    if (controlButtons.classList.contains('show')) {
        controlButtons.classList.remove('show');
        return;
    }

    // Eğer saat kapalıysa sadece aktif et butonunu göster
    if (button.classList.contains('closed')) {
        controlButtons.querySelectorAll('button').forEach(btn => {
            if (btn !== activateBtn) {
                btn.style.display = 'none';
            }
        });
        activateBtn.style.display = 'block';
    } else {
        // Normal durumda telefon ve kapat butonlarını göster
        controlButtons.querySelectorAll('button').forEach(btn => {
            if (btn === activateBtn) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'block';
            }
        });
    }

    controlButtons.classList.add('show');
}

// Telefonla rezervasyon yap
function markAsPhoneBooked(button, input) {
    const container = button.parentElement;
    const controlButtons = container.querySelector('.control-buttons');

    // Create phone booking container if it doesn't exist
    let phoneBookingContainer = container.querySelector('.phone-booking-container');
    if (!phoneBookingContainer) {
        phoneBookingContainer = document.createElement('div');
        phoneBookingContainer.className = 'phone-booking-container';

        const confirmInput = document.createElement('input');
        confirmInput.type = 'text';
        confirmInput.className = 'form-control form-control-sm';
        confirmInput.placeholder = 'Müşteri Bilgisi';

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'phone-booking-actions';

        // Create confirm button
        const confirmButton = document.createElement('button');
        confirmButton.className = 'btn btn-sm btn-success';
        confirmButton.textContent = 'Onayla';
        confirmButton.onclick = function (e) {
            e.stopPropagation();
            confirmPhoneBooking(button, confirmInput, input);
        };

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-sm btn-secondary';
        cancelButton.textContent = 'İptal';
        cancelButton.onclick = function (e) {
            e.stopPropagation();
            cancelPhoneBooking(button, confirmInput);
        };

        actionsDiv.appendChild(cancelButton);
        actionsDiv.appendChild(confirmButton);

        phoneBookingContainer.appendChild(confirmInput);
        phoneBookingContainer.appendChild(actionsDiv);
        container.appendChild(phoneBookingContainer);
    }

    button.classList.remove('available', 'closed');
    button.classList.add('phone-booked');
    button.textContent = 'Dolu';
    phoneBookingContainer.classList.add('show');
    controlButtons.classList.remove('show');
}

// Telefon rezervasyonunu iptal et
function cancelPhoneBooking(button, input) {
    const container = button.parentElement;
    const phoneBookingContainer = container.querySelector('.phone-booking-container');
    const timeSlotRow = container.querySelector('.time-slot-row');

    // Reset the button state
    button.classList.remove('phone-booked');
    button.classList.add('available');
    button.textContent = 'Müsait';

    // Hide the phone booking container and clear input
    phoneBookingContainer.classList.remove('show');
    const confirmInput = phoneBookingContainer.querySelector('input');
    if (confirmInput) {
        confirmInput.value = '';
    }

    // Remove the confirm and cancel buttons
    if (timeSlotRow) {
        timeSlotRow.remove();
    }
}

// Telefon rezervasyonunu onayla
function confirmPhoneBooking(button, customerInput,input) {
    const container = button.parentElement;
    const phoneBookingContainer = container.querySelector('.phone-booking-container');
    const customerInfo = customerInput.value.trim();

    if (!customerInfo) {
        alert('Lütfen müşteri bilgisini giriniz.');
        return;
    }

    // Get the time slot information
    const timeCell = button.closest('td');
    const timeRow = timeCell.closest('tr');
    const timeText = timeRow.cells[0].textContent;
    const dayIndex = Array.from(timeCell.parentElement.parentElement.children).indexOf(timeCell) - 1;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const day = days[dayIndex];
    // Send the confirmation to backend
    updateSlot(button, true, true, customerInfo, -1, -1);
    button.classList.remove('phone-booked')
    button.classList.add('booked')
    phoneBookingContainer.classList.remove('show');
    input.value = customerInfo;
    input.classList.add('show')
}

// Saati kapat
function closeTimeSlot(button, input) {
    const container = button.parentElement;
    const controlButtons = container.querySelector('.control-buttons');

    updateSlot(button, false, false, '', -1, -1)
    button.classList.remove('available', 'phone-booked');
    button.classList.add('closed');
    button.textContent = 'Kapalı';
    input.classList.remove('show');
    input.value = '';
    controlButtons.classList.remove('show');
}

// Saati aktif et
function activateTimeSlot(button, input) {
    const container = button.parentElement;
    const controlButtons = container.querySelector('.control-buttons');
    const row = container.parentElement.parentElement;
    const index = Array.from(row.children).indexOf(container.parentElement) - 1

    const slot_date = new Date(monday);
    slot_date.setDate(monday.getDate() + index);
    slot_date.setHours(0, 0, 0, 0);
    console.log(slot_date)
    const slot_hour = parseInt(row.getElementsByTagName('td')[0].innerText.split(':')[0]);

    updateSlot(button, false, true, '', slot_date, slot_hour);
    button.classList.remove('closed');
    button.classList.add('available');
    button.textContent = 'Müsait';
    input.classList.remove('show');
    input.value = '';
    input.placeholder = 'Rezervasyon Kodu';
    controlButtons.classList.remove('show');
}

// Hafta navigasyonu
function previousWeek() {
    monday.setDate(monday.getDate() - 7);
    const fieldID = document.getElementById('fieldSelect').value
    updateDates(monday)
    updateTimeSlots(fieldID, monday)

}

function nextWeek() {
    monday.setDate(monday.getDate() + 7);
    const fieldID = document.getElementById('fieldSelect').value
    updateDates(monday)
    updateTimeSlots(fieldID, monday)
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;

    monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    loadFacilities();
    updateDates(monday);

    // Tesis seçimi değiştiğinde
    document.getElementById('facilitySelect').addEventListener('change', function () {
        const facilityId = this.value;
        if (facilityId) {
            loadFields(facilityId);
        } else {
            const fieldSelect = document.getElementById('fieldSelect');
            fieldSelect.innerHTML = '<option value="">Önce Tesis Seçin</option>';
            fieldSelect.disabled = true;
            document.getElementById('calendarCard').style.display = 'none';
        }
    });

    // Saha seçimi değiştiğinde
    document.getElementById('fieldSelect').addEventListener('change', function () {
        fieldId = this.value;
        if (fieldId) {
            document.getElementById('calendarCard').style.display = 'block';
            updateTimeSlots(fieldId, monday);
        } else {
            document.getElementById('calendarCard').style.display = 'none';
        }
    });

});
