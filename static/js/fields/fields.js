// Global Variables
let selectedDate = null;
let csrfToken = null;

// Page Load Operations
document.addEventListener('DOMContentLoaded', () => {
    csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value
    document.querySelector("#location-selector").addEventListener("change", loadFacilityCards);
    initializeCalendar();
    loadFacilityCards();
});

// To Initialize and Update Facility Cards
async function loadFacilityCards() {
    // Load Facility Cards
    let location = document.querySelector("#location-selector").value
    let facility_response = await fetch(`/field/get_user_facilities/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
            location: location,
            date: selectedDate,
        }),
    });
    if (!facility_response.ok) {
        alert('İşletmeler yüklenirken bir hata oluştu :(');
        return;
    }
    let facility_data = await facility_response.json();
    if (!facility_data.success) {
        alert("İşletmeler yüklenirken bir hata oluştu :(");
    }
    let card_container = document.querySelector("#facility-card-container");
    card_container.innerHTML = facility_data['html'];


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
        leftSection.addEventListener('click', function () {
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
            fieldButtons.forEach(field_button => {
                field_button.addEventListener('click', async function () {
                    // Remove selected class from all buttons
                    fieldButtons.forEach(btn => btn.classList.remove('selected'));

                    // Add selected class to clicked button
                    this.classList.add('selected');
                    const field_pk = field_button.dataset.field_pk;
                    let reservation_hour_response = await fetch(`/field/get_field_hours/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": csrfToken,
                        },
                        body: JSON.stringify({
                            field_pk: field_pk,
                            selected_date: selectedDate,
                        }),
                    });

                    if (!reservation_hour_response.ok) {
                        alert('Rezervasyon saatleri yüklenirken bir hata oluştu');
                        return;
                    }
                    let reservation_hour_data = await reservation_hour_response.json()
                    if (!reservation_hour_data.success) {
                        alert('Rezervasyon saatleri yüklenirken bir hata oluştu');
                        return;
                    }

                    let hour_options = timeSection.querySelector(".time-content")
                    // Clear existing time slots
                    hour_options.innerHTML = '';

                    reservation_hour_data['field_hours'].forEach((data) => {
                        let new_slot = document.createElement("button");
                        new_slot.classList.add('time-slot-btn');
                        new_slot.dataset['pk'] = data[0];
                        new_slot.innerText = data[1];
                        if (data[2]){
                            new_slot.classList.add('reserved')
                            new_slot.setAttribute('disabled','true');
                            new_slot.setAttribute('aria-disabled','true');
                        }

                        // Add click event listener for time slot selection
                        new_slot.addEventListener('click', async function () {
                            if (new_slot.classList.contains('reserved')){
                                return;
                            }
                            // Remove selected class from all time slot buttons
                            const allTimeSlots = hour_options.querySelectorAll('.time-slot-btn');
                            allTimeSlots.forEach(slot => slot.classList.remove('selected'));
                            // Add selected class to clicked button
                            new_slot.classList.add('selected');
                            timeSelected = true;
                            let team_response = await fetch('/field/get_team_options')
                            if (!team_response.ok) {
                                alert('Takımlar yüklenirken bir hata oluştu');
                                return;
                            }
                            let team_data = await team_response.json();
                            if (!team_data.success) {
                                alert('Takımlar yüklenirken bir hata oluştu');
                                return;
                            }

                            if (team_data['teams'].length === 0) {
                                alert('İlk önce takım oluşturmanız gerekiyor..');
                                return;
                            }
                            let team_options = teamsSection.querySelector(".team-selection-content");
                            team_options.innerHTML = "";
                            team_data['teams'].forEach((team) => {
                                let team_pk = team[0];
                                let team_name = team[1];
                                let new_team = document.createElement('button');

                                new_team.classList.add("team-option-btn");
                                new_team.dataset["team_pk"] = team_pk;
                                new_team.innerText = team_name;

                                new_team.addEventListener('click', () => {
                                    let allTeamOptions = team_options.querySelectorAll(".team-option-btn");
                                    allTeamOptions.forEach(button => {
                                        button.classList.remove("selected");
                                    });
                                    new_team.classList.add("selected");
                                    teamSelected = true;
                                    updateButtonState();
                                });
                                team_options.appendChild(new_team);
                            });
                            container.classList.add('show-teams');
                            updateButtonState();
                        });
                        hour_options.appendChild(new_slot)
                    });
                    fieldSelected = true;
                    container.classList.add('show-time');
                    updateButtonState();
                });
            });
        }

        // Team selection handler
        if (teamsSection) {
            const teamButtons = teamsSection.querySelectorAll('.team-option-btn');
            teamButtons.forEach(button => {
                button.addEventListener('click', function () {
                    // Remove selected class from all team buttons
                    teamButtons.forEach(btn => btn.classList.remove('selected'));
                    // Add selected class to clicked button
                    this.classList.add('selected');
                    teamSelected = true;
                    updateButtonState();
                });
            });
        }
        // Reservation button handler
        if (reservationButton) {
            reservationButton.addEventListener('click', async function (e) {
                if (!fieldSelected || !timeSelected || !teamSelected) {
                    e.preventDefault();
                    return;
                }
                // Get Reservation Details
                const field_pk = container.querySelector(".field-option-btn.selected").dataset.field_pk
                const reservation_hour_pk = container.querySelector(".time-slot-btn.selected").dataset.pk
                const team_pk = container.querySelector(".team-option-btn.selected").dataset.team_pk

                // Make reservation

                let response = await fetch('/reservation/make_reservation/', {
                    method: "POST",
                    headers:{
                        "applicationType": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify({
                        field_pk:field_pk,
                        reservation_hour_pk:reservation_hour_pk,
                        team_pk:team_pk,
                    }),
                });
                if (!response.ok){
                    alert("Rezervayon yapılırken bir hata oluştu.");
                    return;
                }
                let reservation_data = await response.json();
                if (reservation_data.success){
                    alert("Rezervasyon başarı ile oluşturuldu.");
                }
                else {
                    alert("Rezervayon yapılırken bir hata oluştu.");
                    return;
                }
                window.location.reload()
            });
        }

        // Update button state based on selections
        function updateButtonState() {
            if (fieldSelected && timeSelected && teamSelected && reservationButton) {
                reservationButton.classList.add('active');
            }
        }

    });
}

// To Create Calendar for Choosing Date
function initializeCalendar() {
    const dateSelector = document.getElementById('date-selector');
    const calendarPopup = document.getElementById('calendar-popup');
    const calendarDays = document.getElementById('calendar-days');
    const calendarTitle = document.getElementById('calendar-title');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    selectedDate = currentDate;

    // Initialize with today's date
    updateDateDisplay();

    // Show calendar when date selector is clicked
    dateSelector.addEventListener('click', function (e) {
        e.preventDefault();
        calendarPopup.classList.toggle('show');
        renderCalendar();
    });

    // Close calendar when clicking outside
    document.addEventListener('click', function (e) {
        if (!dateSelector.contains(e.target) && !calendarPopup.contains(e.target)) {
            calendarPopup.classList.remove('show');
        }
    });

    // Navigation buttons
    prevMonthBtn.addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Day navigation buttons
    prevDayBtn.addEventListener('click', function () {
        if (selectedDate) {
            selectedDate.setDate(selectedDate.getDate() - 1);
            updateDateDisplay();
            loadFacilityCards();
        } else {
            // If no date is selected, start from today
            selectedDate = new Date(currentDate);
            selectedDate.setDate(selectedDate.getDate() - 1);
            updateDateDisplay();
            loadFacilityCards();
        }
    });

    nextDayBtn.addEventListener('click', function () {
        if (selectedDate) {
            selectedDate.setDate(selectedDate.getDate() + 1);
            updateDateDisplay();
            loadFacilityCards();
        } else {
            // If no date is selected, start from today
            selectedDate = new Date(currentDate);
            selectedDate.setDate(selectedDate.getDate() + 1);
            updateDateDisplay();
            loadFacilityCards();
        }
    });

    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday

        // Update title
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        // Clear previous days
        calendarDays.innerHTML = '';

        // Generate calendar days
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('button');
            dayElement.className = 'calendar-day';
            dayElement.textContent = dayDate.getDate();

            // Check if it's current month
            if (dayDate.getMonth() !== currentMonth) {
                dayElement.classList.add('other-month');
            }

            // Check if it's today
            if (dayDate.toDateString() === currentDate.toDateString()) {
                dayElement.classList.add('today');
            }

            // Check if it's in the past
            if (dayDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) {
                dayElement.classList.add('past');
            }

            // Check if it's selected
            if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }

            // Add click event
            dayElement.addEventListener('click', function () {
                if (!dayElement.classList.contains('other-month') && !dayElement.classList.contains('past')) {
                    // Remove selected class from all days
                    document.querySelectorAll('.calendar-day').forEach(day => {
                        day.classList.remove('selected');
                    });

                    // Add selected class to clicked day
                    dayElement.classList.add('selected');
                    selectedDate = dayDate;

                    // Update input value
                    updateDateDisplay();

                    // Close calendar
                    calendarPopup.classList.remove('show');

                    // Trigger facility cards reload
                    loadFacilityCards();
                }
            });

            calendarDays.appendChild(dayElement);
        }
    }

    function updateDateDisplay() {
        if (selectedDate) {
            const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            dateSelector.value = `${dayNames[selectedDate.getDay()]}, ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
        }
    }
}