function toggleEvaluation() {
    const popup = document.getElementById('evaluationPopup');
    if (popup.style.display === 'none') {
        popup.style.display = 'block';
        // Popup açıldığında oyuncu seçme işlevselliğini ekle
        initializePlayerSelection();
    } else {
        popup.style.display = 'none';
    }
}

// Close popup when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('evaluationPopup');
    
    window.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
            popup.style.display = 'none';
        }
    });
});

function getRandomName() {
    const names = [
        "Messi", "Ronaldo", "Neymar", "Mbappé", "Haaland",
        "De Bruyne", "Salah", "Benzema", "Modric", "Lewandowski",
        "Kane", "Vinicius", "Bellingham", "Gündoğan", "Kvaratskhelia",
        "Saka", "Foden", "Valverde", "Pedri", "Musiala"
    ];
    
    // Daha önce kullanılmamış bir isim seç
    const usedNames = Array.from(document.querySelectorAll('.player-name'))
        .map(span => span.textContent);
    
    const availableNames = names.filter(name => !usedNames.includes(name));
    if (availableNames.length === 0) return "Oyuncu"; // Eğer tüm isimler kullanılmışsa
    
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    return availableNames[randomIndex];
}

function calculateAverage(inputs) {
    let sum = 0;
    inputs.forEach(input => {
        sum += parseInt(input.value) || 0;
    });
    return Math.round(sum / inputs.length);
}

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
        nameSpan.textContent = getRandomName();
    });

    playerItems.forEach(player => {
        // Önce eski event listener'ları temizle
        player.replaceWith(player.cloneNode(true));
    });

    // Slider değişikliklerini dinle ve değerleri güncelle
    document.querySelectorAll('.stat-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            // Slider'ın yanındaki değer göstergesini güncelle
            const valueDisplay = this.nextElementSibling;
            valueDisplay.textContent = this.value;
            
            // Genel istatistikleri güncelle
            updateStatValues();
        });
    });

    // Yeni event listener'ları ekle
    document.querySelectorAll('.player-item').forEach(player => {
        player.addEventListener('click', function() {
            // Önceki seçili oyuncunun border'ını kaldır
            if (selectedPlayer) {
                selectedPlayer.querySelector('img').style.border = 'none';
            }

            // Yeni seçili oyuncuya yeşil border ekle
            const playerImg = this.querySelector('img');
            playerImg.style.border = '2px solid #00ff00';
            selectedPlayer = this;

            // Oyuncu detaylarını güncelle
            const playerName = this.querySelector('.player-name').textContent;
            const playerImage = playerImg.getAttribute('src');
            
            // Detay bölümündeki başlık ve resmi güncelle
            document.querySelector('.player-image-section h3').textContent = playerName;
            document.querySelector('.player-image-section img').src = playerImage;
        });
    });

    // İlk yükleme için stat değerlerini hesapla
    updateStatValues();
}

document.addEventListener('DOMContentLoaded', function() {
    const assignTeamButton = document.querySelector('.assign-team-button');
    const playerGrid = document.querySelector('.player-icons');
    const team1Title = document.querySelector('.team1-title');
    const team2Title = document.querySelector('.team2-title');
    const playerCards = document.querySelectorAll('.player-card');
    let isTeamsSeparated = false;

    assignTeamButton.addEventListener('click', function() {
        if (!isTeamsSeparated) {
            // Create team containers
            const team1Container = document.createElement('div');
            const team2Container = document.createElement('div');
            team1Container.className = 'team-container';
            team2Container.className = 'team-container';

            // Separate teams
            const players = Array.from(playerCards);
            const halfLength = Math.ceil(players.length / 2);
            
            // Move players to their respective team containers
            players.forEach((card, index) => {
                if (index < halfLength) {
                    card.setAttribute('data-team', '1');
                    team1Container.appendChild(card);
                } else {
                    card.setAttribute('data-team', '2');
                    team2Container.appendChild(card);
                }
            });

            // Clear the original grid and add team containers
            playerGrid.innerHTML = '';
            playerGrid.appendChild(team1Container);
            playerGrid.appendChild(team2Container);

            // Update UI
            playerGrid.classList.add('teams-separated');
            team1Title.textContent = 'Team 1';
            team2Title.style.display = 'block';
            assignTeamButton.textContent = 'Show All';
            isTeamsSeparated = true;
        } else {
            // Reset to initial state
            const allPlayers = Array.from(playerGrid.querySelectorAll('.player-card'));
            playerGrid.innerHTML = '';
            allPlayers.forEach(card => {
                card.setAttribute('data-team', '1');
                playerGrid.appendChild(card);
            });

            playerGrid.classList.remove('teams-separated');
            team1Title.textContent = 'Tüm Oyuncular';
            team2Title.style.display = 'none';
            assignTeamButton.textContent = 'Taraflara Ayır';
            isTeamsSeparated = false;
        }
    });
});