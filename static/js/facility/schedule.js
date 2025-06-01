// Saat dilimlerini güncelle
function updateTimeSlots(scheduleData) {
    const timeSlots = document.getElementById('timeSlots');
    timeSlots.innerHTML = '';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // 03:00'dan 02:00'a kadar saat dilimlerini oluştur
    for (let hour = 3; hour <= 26; hour++) {
        const displayHour = hour % 24;
        const nextHour = (hour + 1) % 24;
        const startTime = displayHour;

        const timeText = `${displayHour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`;
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = timeText;
        row.appendChild(timeCell);

        // Her gün için durumu kontrol et
        days.forEach((day, dayIndex) => {
            const cell = document.createElement('td');
            const button = document.createElement('button');
            const isActive = scheduleData[day].includes(startTime);
            button.className = `btn btn-sm time-slot ${isActive ? 'active' : 'inactive'}`;
            button.textContent = isActive ? 'Açık' : 'Kapalı';
            button.dataset.time = timeText;
            button.dataset.day = day;
            button.onclick = function () {
                toggleTimeSlot(this);
            };
            cell.appendChild(button);
            row.appendChild(cell);
        });

        timeSlots.appendChild(row);
    }
}

// Tüm saat dilimlerini aç/kapat
function toggleAllSlots(day) {
    const buttons = document.querySelectorAll(`.time-slot[data-day="${day}"]`);
    const allActive = Array.from(buttons).every(button => button.classList.contains('active'));
    
    buttons.forEach(button => {
        if (allActive) {
            button.classList.remove('active');
            button.classList.add('inactive');
            button.textContent = 'Kapalı';
        } else {
            button.classList.remove('inactive');
            button.classList.add('active');
            button.textContent = 'Açık';
        }
    });
}

// Saat dilimini aç/kapat
function toggleTimeSlot(button) {
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        button.classList.add('inactive');
        button.textContent = 'Kapalı';
    } else {
        button.classList.remove('inactive');
        button.classList.add('active');
        button.textContent = 'Açık';
    }
}

// Çalışma saatlerini kaydet
function saveSchedule() {
    const schedule = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
    };

    const rows = document.querySelectorAll('#timeSlots tr');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    rows.forEach(row => {
        const timeText = row.cells[0].textContent;
        const startTime = parseInt(timeText.split('-')[0]);
        
        Array.from(row.cells).slice(1).forEach((cell, index) => {
            const button = cell.querySelector('.time-slot');
            if (button.classList.contains('active')) {
                schedule[days[index]].push(startTime);
            }
        });
    });
    // Backend'e kaydet
    const fieldID = window.location.pathname.split('/').filter(Boolean).pop();
    fetch(`/field/schedule/save/${fieldID}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(schedule)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Çalışma saatleri başarıyla kaydedildi!');
        } else {
            alert('Bir hata oluştu: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    });
}

// CSRF token'ı al
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

// Verileri yükle
function loadDayData() {
    const fieldID = window.location.pathname.split('/').filter(Boolean).pop();
    fetch(`/field/schedule/get/${fieldID}/`)
        .then(response => response.json())
        .then(data => {
            if (!data['success']) {
                alert(data['error'])
            }
            updateTimeSlots(data['schedule']);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Çalışma saatleri yüklenirken bir hata oluştu.');
        });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    // Verileri yükle
    loadDayData();
});
