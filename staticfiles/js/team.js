let slideIndex = 0;

function showSlides() {
    const slides = document.querySelector('.slides');
    const totalSlides = slides.children.length;
    if (slideIndex >= totalSlides) {
        slideIndex = 0;
    }
    if (slideIndex < 0) {
        slideIndex = totalSlides - 1;
    }
    slides.style.transform = 'translateX(' + (-slideIndex * 100) + '%)';
}

function changeSlide(n) {
    slideIndex += n;
    showSlides();
}

// İlk slide'ı göster
showSlides();

function openPopup() {
    document.getElementById("editPopup").style.display = "block";
}

function closePopup() {
    document.getElementById("editPopup").style.display = "none";
}

// Sürükle-bırak işlemleri için yeni fonksiyonlar
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    // Hem player-card hem de dropped-player-card için çalışacak şekilde güncelle
    window.draggedCard = event.target.closest('.player-card, .dropped-player-card');
    event.dataTransfer.setData("text", window.draggedCard.id);
}

function drop(event) {
    event.preventDefault();

    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Eğer sürüklenen kart zaten sağ tarafta ise, sadece pozisyonunu güncelle
    if (window.draggedCard.classList.contains('dropped-player-card')) {
        window.draggedCard.style.left = `${x - 25}px`;
        window.draggedCard.style.top = `${y - 25}px`;
        return;
    }

    // Yeni kart oluştur
    const newCard = document.createElement('div');
    newCard.className = 'dropped-player-card';
    newCard.setAttribute('draggable', true);
    newCard.setAttribute('id', 'dropped-' + Date.now()); // Unique ID ekle
    newCard.style.cssText = `
            position: absolute;
            left: ${x - 25}px;
            top: ${y - 25}px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: move;
        `;

    // Orijinal karttan bilgileri al
    const originalImg = window.draggedCard.querySelector('img');
    const originalText = window.draggedCard.querySelector('p').textContent;

    // Her durumda hem resmi hem yazıyı göster
    newCard.innerHTML = `
            <img src="${originalImg.src}" alt="${originalImg.alt}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; border: 2px solid ${originalImg.style.borderColor || 'red'};">
            <p style="margin: 4px 0; color: black; font-weight: bold; font-size: 12px;">${originalText}</p>
            <div style="display: flex; gap: 5px; margin-top: 4px;">
                <button onclick="changeColor(this, 'red')" style="width: 20px; height: 20px; background-color: red; border: none; border-radius: 50%; cursor: pointer;"></button>
                <button onclick="changeColor(this, 'blue')" style="width: 20px; height: 20px; background-color: blue; border: none; border-radius: 50%; cursor: pointer;"></button>
            </div>
        `;

    // Yeni karta drag event listener ekle
    newCard.addEventListener('dragstart', drag);

    // Kartı popup-right'a ekle
    document.querySelector('.popup-right').appendChild(newCard);

    // Orijinal kartı kaldır (eğer sol panelden sürüklendiyse)
    if (window.draggedCard.closest('.popup-left')) {
        window.draggedCard.remove();
    }

    window.draggedCard = null;

    // Drop işlemi tamamlandıktan sonra preview'i güncelle
    updatePreviewCards();
}

// Her bir karta drag özelliği ekle
document.querySelectorAll('.player-card').forEach((card, index) => {
    card.setAttribute('id', 'player-card-' + index); // Her karta unique id ekle
    card.addEventListener('dragstart', drag);
    card.setAttribute('draggable', true);
});

// Renk değiştirme fonksiyonu ekle
function changeColor(button, color) {
    const card = button.closest('.player-card, .dropped-player-card');
    const img = card.querySelector('img');
    img.style.borderColor = color;
}

function saveImage() {
    const rightDiv = document.querySelector('.popup-right');

    // Butonları geçici olarak gizle
    const colorButtons = rightDiv.querySelectorAll('.dropped-player-card div');
    colorButtons.forEach(buttonDiv => {
        buttonDiv.style.display = 'none';
    });

    const options = {
        backgroundColor: null,
        scale: 2,
        useCORS: true
    };

    html2canvas(rightDiv, options).then(canvas => {
        // Canvas'ı base64 formatına çevir
        const image = canvas.toDataURL("image/png");

        // Sol taraftaki img elementini güncelle
        const leftImage = document.querySelector('.left-div img');
        leftImage.src = image;

        // Butonları tekrar göster
        colorButtons.forEach(buttonDiv => {
            buttonDiv.style.display = 'flex';
        });

        // Görüntüyü sunucuya gönder
        fetch('/saveImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: image,
                filename: 'yenisaha.png'
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Görüntü başarıyla kaydedildi');
                } else {
                    console.error('Görüntü kaydedilemedi');
                }
            })
            .catch(error => {
                console.error('Hata:', error);
            });

        // Popup'ı kapat
        closePopup();
    });
}

// Preview kartları güncelleme fonksiyonunu güncelle
function updatePreviewCards() {
    const previewContainer = document.getElementById('preview-cards-container');
    const droppedCards = document.querySelectorAll('.popup-right .dropped-player-card');

    // Preview container'ı temizle
    previewContainer.innerHTML = '';

    // Her dropped card için preview oluştur
    droppedCards.forEach(card => {
        const previewCard = document.createElement('div');
        const rect = card.getBoundingClientRect();
        const parentRect = card.parentElement.getBoundingClientRect();

        // Göreceli pozisyonları hesapla
        const relativeX = ((rect.left - parentRect.left) / parentRect.width) * 100;
        const relativeY = ((rect.top - parentRect.top) / parentRect.height) * 100;

        previewCard.style.cssText = `
                position: absolute;
                left: ${relativeX}%;
                top: ${relativeY}%;
                transform: translate(-50%, -50%);
            `;

        // Kartın içeriğini kopyala
        const img = card.querySelector('img');
        previewCard.innerHTML = `
                <img src="${img.src}" alt="${img.alt}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; border: ${img.style.border};">
            `;

        previewContainer.appendChild(previewCard);
    });
}

// Kartım popup işlemleri
document.addEventListener('DOMContentLoaded', function () {
    const kartimLink = document.querySelector('.nav-menu ul li:first-child');
    const kartimPopup = document.getElementById('kartimPopup');
    const kartimClose = document.querySelector('.kartim-close');

    // Kartım linkine tıklandığında
    kartimLink.addEventListener('click', function () {
        kartimPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Arka planı scroll edilemez yap
    });

    // Çarpı işaretine tıklandığında
    kartimClose.addEventListener('click', function () {
        kartimPopup.style.display = 'none';
        document.body.style.overflow = 'auto'; // Scroll'u geri aç
    });

    // Popup dışına tıklandığında
    kartimPopup.addEventListener('click', function (e) {
        if (e.target === kartimPopup) {
            kartimPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

