// Tarihleri güncelle
function updateDates() {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateText = `${date.getDate()} ${months[date.getMonth()]}`;
        document.getElementById(`${days[i]}-date`).textContent = dateText;
    }
}

// Saat dilimlerini güncelle
function updateTimeSlots() {
    const startHour = parseInt(document.getElementById('startHour').value);
    let endHour = parseInt(document.getElementById('endHour').value);

    // Eğer kapanış saati açılış saatinden küçükse, 24 saat ekle
    if (endHour <= startHour) {
        endHour += 24;
    }

    // Mevcut saat dilimlerini temizle
    const timeSlots = document.getElementById('timeSlots');
    timeSlots.innerHTML = '';

    // Yeni saat dilimlerini oluştur
    for (let hour = startHour; hour < endHour; hour++) {
        const displayHour = hour % 24; // 24'ten büyük saatleri düzelt
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = `${displayHour}:00 - ${(displayHour + 1) % 24}:00`;
        row.appendChild(timeCell);

        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('td');
            const container = document.createElement('div');
            container.className = 'time-slot-container';

            const button = document.createElement('button');
            button.className = 'btn btn-sm time-slot available';
            button.textContent = 'Müsait';
            button.onclick = function () {
                showControlButtons(this);
            };

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control form-control-sm reservation-code-input';
            input.placeholder = 'Rezervasyon Kodu';

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
        }

        timeSlots.appendChild(row);
    }

    // Çarşamba 13-14'ü online rezervasyon olarak işaretle
    const wednesdayCells = document.querySelectorAll('tr:nth-child(5) td'); // 13:00-14:00 satırı
    const wednesdayCell = wednesdayCells[3]; // Çarşamba sütunu
    const button = wednesdayCell.querySelector('.time-slot');
    const input = wednesdayCell.querySelector('.reservation-code-input');

    if (button && input) {
        button.classList.remove('available');
        button.classList.add('booked');
        button.textContent = 'Dolu';
        input.classList.add('show');
        input.value = 'ONL456'; // Örnek rezervasyon kodu
    }
}

// Çalışma saatlerini kaydet
function saveTimeSettings() {
    const startHour = document.getElementById('startHour').value;
    const endHour = document.getElementById('endHour').value;

    // Burada backend'e kaydetme işlemi yapılabilir
    alert(`Çalışma saatleri kaydedildi: ${startHour}:00 - ${endHour}:00`);
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

    button.classList.remove('available', 'closed');
    button.classList.add('phone-booked');
    button.textContent = 'Dolu';
    input.classList.add('show');
    input.placeholder = 'Kiracı Bilgisi';
    input.value = '';
    controlButtons.classList.remove('show');
}

// Saati kapat
function closeTimeSlot(button, input) {
    const container = button.parentElement;
    const controlButtons = container.querySelector('.control-buttons');

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
    alert('Önceki hafta');
}

function nextWeek() {
    alert('Sonraki hafta');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    console.log("Anan")
    updateTimeSlots();
    updateDates();
    document.querySelector('.section-header').classList.add('active');
});
