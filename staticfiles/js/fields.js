document.addEventListener('DOMContentLoaded', function() {
    // Get all field info containers
    const fieldContainers = document.querySelectorAll('.field-info-container');

    fieldContainers.forEach(container => {
        const leftSection = container.querySelector('.field-left-section');
        const timeSection = container.querySelector('.time-slots-section');
        const teamsSection = container.querySelector('.teams-content');
        const reservationButton = container.querySelector('.reservation-button');
        let timeSelected = false;
        let teamSelected = false;

        // Click on left section expands to show time section
        leftSection.addEventListener('click', function() {
            // Remove show-time class from all other containers
            fieldContainers.forEach(cont => {
                if (cont !== container) {
                    cont.classList.remove('show-time', 'show-teams');
                }
            });
            container.classList.add('show-time');
        });

        // Time selection handler
        if (timeSection) {
            timeSection.addEventListener('click', function() {
                timeSelected = true;
                container.classList.add('show-teams');
                updateButtonState();
            });
        }

        // Team selection handler
        if (teamsSection) {
            teamsSection.addEventListener('click', function() {
                teamSelected = true;
                updateButtonState();
            });
        }

        // Update button state based on selections
        function updateButtonState() {
            if (timeSelected && teamSelected && reservationButton) {
                reservationButton.classList.add('active');
            }
        }

        // Reservation button handler
        if (reservationButton) {
            reservationButton.addEventListener('click', function(e) {
                if (!timeSelected || !teamSelected) {
                    e.preventDefault();
                    return;
                }
                // Handle reservation action here
                console.log('Reservation submitted!');
            });
        }
    });
});
