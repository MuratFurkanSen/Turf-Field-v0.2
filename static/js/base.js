// Kartım popup işlemleri
document.addEventListener('DOMContentLoaded', function () {
    const kartimLink = document.querySelector('.nav-menu ul li:first-child a');
    const kartimPopup = document.getElementById('kartimPopup');
    const kartimClose = document.querySelector('.kartim-close');

    // Ensure popup is closed by default
    if (kartimPopup) {
        kartimPopup.style.display = 'none';
    }

    // Kartım linkine tıklandığında
    if (kartimLink) {
        kartimLink.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (kartimPopup) {
                kartimPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Çarpı işaretine tıklandığında
    if (kartimClose) {
        kartimClose.addEventListener('click', function () {
            if (kartimPopup) {
                kartimPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Popup dışına tıklandığında
    if (kartimPopup) {
        kartimPopup.addEventListener('click', function (e) {
            if (e.target === kartimPopup) {
                kartimPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}); 