function updateStatValues() {
    // Hız ortalaması
    const speedInputs = document.querySelectorAll('.speed-input');
    const speedStat = document.querySelector('.speed-stat');
    speedStat.textContent = calculateAverage(speedInputs);

    // Şut ortalaması
    const shootingInputs = document.querySelectorAll('.shooting-input');
    const shootingStat = document.querySelector('.shooting-stat');
    shootingStat.textContent = calculateAverage(shootingInputs);

    // Pas ortalaması
    const passingInputs = document.querySelectorAll('.passing-input');
    const passingStat = document.querySelector('.passing-stat');
    passingStat.textContent = calculateAverage(passingInputs);

    // Dribbling ortalaması
    const dribblingInputs = document.querySelectorAll('.dribbling-input');
    const dribblingStat = document.querySelector('.dribbling-stat');
    dribblingStat.textContent = calculateAverage(dribblingInputs);

    // Defans ortalaması
    const defenseInputs = document.querySelectorAll('.defense-input');
    const defenseStat = document.querySelector('.defense-stat');
    defenseStat.textContent = calculateAverage(defenseInputs);

    // Fizik ortalaması
    const physicalInputs = document.querySelectorAll('.physical-input');
    const physicalStat = document.querySelector('.physical-stat');
    physicalStat.textContent = calculateAverage(physicalInputs);
}

function initializePlayerSelection() {
    const playerItems = document.querySelectorAll('.player-item');
    let selectedPlayer = null;

    // Her oyuncuya rastgele isim ata
    playerItems.forEach(player => {
        const nameSpan = player.querySelector('.player-name');
        nameSpan.textContent = 'getRandomName';
    });

    playerItems.forEach(player => {
        // Önce eski event listener'ları temizle
        player.replaceWith(player.cloneNode(true));
    });

    // Slider değişikliklerini dinle ve değerleri güncelle
    document.querySelectorAll('.stat-slider').forEach(slider => {
        slider.addEventListener('input', function () {
            // Slider'ın yanındaki değer göstergesini güncelle
            const valueDisplay = this.nextElementSibling;
            valueDisplay.textContent = this.value;

            // Genel istatistikleri güncelle
            updateStatValues();
        });
    });

    // Yeni event listener'ları ekle
    document.querySelectorAll('.player-item').forEach(player => {
        player.addEventListener('click', function () {
            // Önceki seçili oyuncunun border'ını kaldır
            if (selectedPlayer) {
                selectedPlayer.classList.remove('selected');
            }
            selectedPlayer = player;

            // Oyuncu detaylarını güncelle
            const playerName = this.querySelector('.player-name').textContent;
            const playerImage = player.querySelector('img').getAttribute('src');

            // Detay bölümündeki başlık ve resmi güncelle
            document.querySelector('.player-image-section h3').textContent = playerName;
            document.querySelector('.player-image-section img').src = playerImage;
        });
    });

    // İlk yükleme için stat değerlerini hesapla
    updateStatValues();
}

function toggleStaffEvaluation(button) {
    const popup = document.getElementById('staffEvalPopup');
    if (window.getComputedStyle(popup).getPropertyValue('display') === 'none') {
        popup.style.display = 'block';
        // Popup açıldığında oyuncu seçme işlevselliğini ekle
        updatePlayerSelection(button);
    } else {
        popup.style.display = 'none';
    }
}

// Close popup when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('staffEvalPopup');

    window.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
        }
    });
});

async function updatePlayerSelection(button) {
    let reservation_pk = button.closest('.reservation-item').dataset.reservation_pk;
    let player_grid = document.querySelector('.staff-eval-players-section');
    let submit_button = document.querySelector('.submit-evaluation-button');

    submit_button.dataset['reservation_pk'] = reservation_pk;

    let selectedPlayer = null;
    player_grid.innerHTML = '';

    let resp = await fetch('/reservation/get_review_pending_users/', {
        method: 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            'reservation_pk': reservation_pk,
        })
    });
    if (!resp.ok) {
        alert('Bir şeyler yanlış gitti');
        return;
    }
    let data = await resp.json();
    if (!data.success) {
        alert('Bir şeyler yanlış gitti');
        return;
    }

    data['players'].forEach(player => {
        let card = document.createElement('div');
        card.classList.add('staff-eval-player-item');
        card.dataset['player_id'] = player['id'];
        card.dataset['player_position'] = player['position'];

        let image = document.createElement('img');
        image.setAttribute('src', player['picture']);
        image.setAttribute('alt', player['username']);

        let span = document.createElement('span');
        span.classList.add('staff-eval-player-name');
        span.textContent = player['username'];

        card.appendChild(image);
        card.appendChild(span);
        player_grid.appendChild(card);
    })

    Array.from(player_grid.children).forEach(player => {
        // Önce eski event listener'ları temizle
        player.replaceWith(player.cloneNode(true));
    });

    // Slider değişikliklerini dinle ve değerleri güncelle
    document.querySelectorAll('.staff-eval-stat-slider').forEach(slider => {
        slider.addEventListener('input', function () {
            // Slider'ın yanındaki değer göstergesini güncelle
            const valueDisplay = this.nextElementSibling;
            valueDisplay.textContent = this.value;

            // Genel istatistikleri güncelle
            updateStaffStatValues();
        });
    });

    // Yeni event listener'ları ekle
    document.querySelectorAll('.staff-eval-player-item').forEach(player => {
        player.addEventListener('click', function () {
            if (selectedPlayer) {
                selectedPlayer.classList.remove('selected');
            }
            selectedPlayer = player;
            player.classList.add('selected');

            // Oyuncu detaylarını güncelle
            const playerName = player.querySelector('.staff-eval-player-name').textContent;
            const playerImage = player.querySelector('img').getAttribute('src');
            const playerPosition = `Position: ${player.dataset['player_position']}`

            // Detay bölümündeki başlık ve resmi güncelle
            document.querySelector('.staff-eval-image-section h3').textContent = playerName;
            document.querySelector('.staff-eval-image-section img').src = playerImage;
            document.querySelector('.staff-eval-image-section h4').textContent = playerPosition;
        });
    });

    // İlk yükleme için stat değerlerini hesapla
    updateStaffStatValues();
}

function updateStaffStatValues() {
    // Hız ortalaması
    const speedInputs = document.querySelectorAll('.speed-input');
    const speedStat = document.querySelector('.speed-stat');
    speedStat.textContent = calculateAverage(speedInputs);

    // Şut ortalaması
    const shootingInputs = document.querySelectorAll('.shooting-input');
    const shootingStat = document.querySelector('.shooting-stat');
    shootingStat.textContent = calculateAverage(shootingInputs);

    // Pas ortalaması
    const passingInputs = document.querySelectorAll('.passing-input');
    const passingStat = document.querySelector('.passing-stat');
    passingStat.textContent = calculateAverage(passingInputs);

    // Dribbling ortalaması
    const dribblingInputs = document.querySelectorAll('.dribbling-input');
    const dribblingStat = document.querySelector('.dribbling-stat');
    dribblingStat.textContent = calculateAverage(dribblingInputs);

    // Defans ortalaması
    const defenseInputs = document.querySelectorAll('.defense-input');
    const defenseStat = document.querySelector('.defense-stat');
    defenseStat.textContent = calculateAverage(defenseInputs);

    // Fizik ortalaması
    const physicalInputs = document.querySelectorAll('.physical-input');
    const physicalStat = document.querySelector('.physical-stat');
    physicalStat.textContent = calculateAverage(physicalInputs);
}

async function submitEvaluation(button) {
    const selectedPlayer = document.querySelector('.staff-eval-player-item.selected');
    const reservation_pk = button.dataset['reservation_pk'];
    const playerId = selectedPlayer.dataset.player_id;

    if (!selectedPlayer) {
        alert('Lütfen bir oyuncu seçin');
        return;
    }
    const stats = {
        acceleration: document.getElementById('accelerationInput').value,
        sprint_speed: document.getElementById('sprintSpeedInput').value,

        attack_position: document.getElementById('shootingPositionInput').value,
        finishing: document.getElementById('finishingInput').value,
        shot_power: document.getElementById('shotPowerInput').value,

        vision: document.getElementById('visionInput').value,
        short_pass: document.getElementById('shortPassInput').value,
        long_pass: document.getElementById('longPassInput').value,

        agility: document.getElementById('agilityInput').value,
        ball_control: document.getElementById('ballControlInput').value,
        dribble: document.getElementById('dribbleInput').value,

        def_awareness: document.getElementById('defAwarenessInput').value,
        interceptions: document.getElementById('interceptionsInput').value,

        stamina: document.getElementById('staminaInput').value,
        strength: document.getElementById('strengthInput').value,
    };

    // Send the evaluation data to the server
    let resp = await fetch('/reservation/submit_review/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            reservation_pk: reservation_pk,
            player_pk: playerId,
            stats: stats,
        })
    });
    if (!resp.ok) {
        alert('Bir şeyler yanlış gitti !!!');
        return;
    }
    let data = await resp.json();
    if (!data.success) {
        alert('Bir şeyler yanlış gitti !!!');
        return;
    }
    alert('Değerlendirme Başarı ile kaydedildi');
    window.location.reload();
}

// Helper function to get CSRF token
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

function calculateAverage(inputs) {
    let sum = 0;
    inputs.forEach(input => {
        sum += parseInt(input.value) || 0;
    });
    return Math.round(sum / inputs.length);
}