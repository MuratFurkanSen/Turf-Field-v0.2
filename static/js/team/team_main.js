let slideIndex = 0;

// İlk slide'ı göster
showSlides();

function showSlides() {
    const slides = document.querySelector('.slides');
    const totalSlides = slides.children.length;
    if (slideIndex >= totalSlides) {
        slideIndex = 0;
    }
    if (slideIndex < 0) {
        slideIndex = totalSlides - 1;
    }
    slides.style.transform = `translateX(${-slideIndex * 100}%)`;
}

function changeSlide(n) {
    slideIndex += n;
    showSlides();
}

function openPopup() {
    const popup = document.getElementById("editPopup");
    popup.classList.remove('hide');
    popup.classList.add('show');
}

function closePopup() {
    const popup = document.getElementById("editPopup");
    popup.classList.remove('show');
    popup.classList.add('hide');
}

// Sürükle-bırak işlemleri için yeni fonksiyonlar
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    // Just use player-card since we're moving the actual card
    window.draggedCard = event.target.closest('.player-card');
}

function drop(event) {
    event.preventDefault();

    const popupRight = document.querySelector('.popup-right');
    const rect = popupRight.getBoundingClientRect();

    // Calculate position relative to the popup-right container
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    // If the card is already in the right panel, just update its position
    if (window.draggedCard.parentElement.classList.contains('popup-right')) {
        window.draggedCard.classList.position = 'absolute';
        window.draggedCard.style.left = `${x - 25}px`;
        window.draggedCard.style.top = `${y - 25}px`;
        return;
    }

    // Move the card to the right panel
    window.draggedCard.classList.position = 'absolute';
    window.draggedCard.style.left = `${x - 25}px`;
    window.draggedCard.style.top = `${y - 25}px`;
    popupRight.appendChild(window.draggedCard);

    window.draggedCard = null;
}

// Renk değiştirme fonksiyonu ekle
function changeColor(button, color) {
    const card = button.closest('.player-card');
    const img = card.querySelector('img');
    img.style.borderColor = color;
}

function savePositions() {
    const rightDiv = document.querySelector('.popup-right');

    const playerCards = rightDiv.querySelectorAll('.player-card');
    const players = Array.from(playerCards).map(card => ({
        id: card.dataset.id,
        left: parseInt(card.style.left.replace('px', '')),
        top: parseInt(card.style.top.replace('px', '')),
        color: card.querySelector('img').style.borderColor || 'red'
    }));

    const teamId = window.location.href.split('/').filter(Boolean).pop();

    fetch('/team/save_positions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            team_pk: teamId,
            players: players
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Takım Düzeni Başarı ile kaydedildi');
                capturePreview();
                closePopup();
            } else {
                alert('Error');
            }
        });
}

function toggleSelection(element) {
    element.classList.toggle('selected');
    updateSelectionCount();
}

function updateSelectionCount() {
    const selectedPlayers = document.querySelectorAll('.player-item.selected');
    const countElement = document.getElementById('selectedCount');
    countElement.textContent = selectedPlayers.length;
}

// Initialize drag functionality for player cards
document.addEventListener('DOMContentLoaded', function () {
    // Add drag functionality to all player cards
    document.querySelectorAll('.player-card').forEach((card) => {
        card.addEventListener('dragstart', drag);
    });

    // Set background image for popup-right
    const popupRight = document.querySelector('.popup-right');
    if (popupRight && popupRight.dataset.bgImage) {
        popupRight.style.setProperty('--bg-image', `url(${popupRight.dataset.bgImage})`);
    }

    // Form submission handler
    const playerSearchForm = document.getElementById('playerSearchForm');
    if (playerSearchForm) {
        playerSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = this.querySelector('input[name="username"]').value;
            const teamId = window.location.href.split('/').filter(Boolean).pop();

            fetch(`/team/invite/${teamId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({username})
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Kullanıcıya Davet Başarılı Bir Şekilde Gönderildi');
                        this.querySelector('input[name="username"]').value = '';
                    } else {
                        alert(data.error || 'Oyuncu eklenirken bir hata oluştu.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Bir hata oluştu. Lütfen tekrar deneyin.');
                });
        });
    }

    capturePreview();
});

document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
        window.draggedCard = e.target;
    });

    card.addEventListener('dragend', (e) => {
        const popupRight = document.querySelector('.popup-right');
        const popupLeft = document.querySelector('.popup-left');
        const popupLeftPlayers = popupLeft.querySelector('.player-cards');
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY);

        if (!popupRight.contains(dropTarget)) {
            // Remove positioning
            window.draggedCard.style.position = '';
            window.draggedCard.style.left = '-1px';
            window.draggedCard.style.top = '-1px';
            window.draggedCard.style.display = '';
            window.draggedCard.style.float = 'none';

            // Move card to left panel's grid container
            popupLeftPlayers.appendChild(window.draggedCard);

            // Optionally save the reset position to the backend immediately
            const teamId = window.location.href.split('/').filter(Boolean).pop();
            const playerToUpdate = {
                id: window.draggedCard.dataset.id,
                left: -1,
                top: -1,
                color: window.draggedCard.querySelector('img').style.borderColor || 'red'
            };

            fetch('/team/save_positions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    team_pk: teamId,
                    players: [playerToUpdate]
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        console.error('Error saving reset position on dragend');
                    }
                });
        }

        // Clear reference
        window.draggedCard = null;
    });
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closePopup();
    }
});

function capturePreview() {
    const original = document.getElementById('layout');
    const previewContainer = document.getElementById('layoutPreview');

    // Clone the layout and place it off-screen
    const clone = original.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    const colorButtons = clone.querySelectorAll('.player-card .color-buttons');
    colorButtons.forEach(buttonDiv => buttonDiv.style.display = 'none');
    document.body.appendChild(clone);

    html2canvas(clone).then(canvas => {
        // Remove the cloned div from DOM
        document.body.removeChild(clone);

        // Draw scaled-down version
        const scale = 0.5;
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;

        const ctx = scaledCanvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);

        previewContainer.innerHTML = '';
        previewContainer.appendChild(scaledCanvas);
    });
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

function resetPositions() {
    if (confirm('Takım Düzenini Sıfırlamak istediğinizie emin misiniz ? Bu işlem geri alınamaz!!')) {
        const popupRight = document.querySelector('.popup-right');
        const popupLeft = document.querySelector('.popup-left .player-cards');
        const rightCards = popupRight.querySelectorAll('.player-card');

        // Move all cards back to left panel
        rightCards.forEach(card => {
            // Remove absolute positioning and reset position values
            card.style.position = '';
            card.style.left = '-1px';
            card.style.top = '-1px';
            // Move card to left panel
            popupLeft.appendChild(card);
        });

        // Save the reset positions
        const teamId = window.location.href.split('/').filter(Boolean).pop();
        const players = Array.from(rightCards).map(card => ({
            id: card.dataset.id,
            left: -1,
            top: -1,
            color: 'red'
        }));

        fetch('/team/save_positions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                team_pk: teamId,
                players: players
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Takım Düzeni Sıfırlandı');
                    capturePreview();
                    closePopup();
                } else {
                    alert('Error');
                }
            });
    }
}

