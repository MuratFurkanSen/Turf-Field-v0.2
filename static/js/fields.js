document.addEventListener('DOMContentLoaded', function() {
    // Get all field info containers
    const fieldContainers = document.querySelectorAll('.field-info-container');

    fieldContainers.forEach(container => {
        const leftSection = container.querySelector('.field-left-section');
        const fieldSelectionSection = container.querySelector('.field-selection-section');
        const timeSection = container.querySelector('.time-slots-section');
        const teamsSection = container.querySelector('.teams-content');
        const reservationButton = container.querySelector('.reservation-button');
        const verticalSeparator = container.querySelector('.vertical-separator');
        let fieldSelected = false;
        let timeSelected = false;
        let teamSelected = false;

        // Click on left section expands to show field selection section
        leftSection.addEventListener('click', function() {
            // Remove show classes from all other containers
            fieldContainers.forEach(cont => {
                if (cont !== container) {
                    cont.classList.remove('show-field', 'show-time', 'show-teams');
                }
            });
            container.classList.add('show-field');
            
            // Show vertical separator when field selection is shown
            if (verticalSeparator) {
                verticalSeparator.style.width = '2px';
                verticalSeparator.style.margin = '0 1rem';
            }
        });

        // Field selection handler
        if (fieldSelectionSection) {
            const fieldButtons = fieldSelectionSection.querySelectorAll('.field-option-btn');
            fieldButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove selected class from all buttons
                    fieldButtons.forEach(btn => btn.classList.remove('selected'));
                    // Add selected class to clicked button
                    this.classList.add('selected');
                    fieldSelected = true;
                    container.classList.add('show-time');
                    updateButtonState();
                });
            });
        }

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
            if (fieldSelected && timeSelected && teamSelected && reservationButton) {
                reservationButton.classList.add('active');
            }
        }

        // Reservation button handler
        if (reservationButton) {
            reservationButton.addEventListener('click', function(e) {
                if (!fieldSelected || !timeSelected || !teamSelected) {
                    e.preventDefault();
                    return;
                }
                // Handle reservation action here
                console.log('Reservation submitted!');
            });
        }
    });
});
