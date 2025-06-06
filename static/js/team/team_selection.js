document.addEventListener('DOMContentLoaded', function () {
    const teamsBtn = document.getElementById('teamsBtn');
    const teamsPopup = document.getElementById('teamsPopup');
    const closePopup = document.querySelector('.close-popup');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const createTeamForm = document.getElementById('createTeamForm');
    const teamsList = document.querySelector('.teams-list');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentPair = 0;
    let totalPairs = 0;

    // Function to create the create new team card
    function createNewTeamCard() {
        const createTeamCard = document.createElement('div');
        createTeamCard.className = 'create-team-card';
        createTeamCard.innerHTML = `
            <i class="fas fa-plus-circle"></i>
            <span>Yeni Takım Oluştur</span>
        `;

        createTeamCard.addEventListener('click', function() {
            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            // Show create team form
            document.getElementById('create-team').classList.add('active');
            // Update tab buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
        });

        return createTeamCard;
    }

    // Function to create a team card
    function createTeamCard(team) {
        const teamItem = document.createElement('a');
        teamItem.href = `/team/${team.id}`;
        teamItem.className = 'team-item';
        teamItem.innerHTML = `
            <div class="team-info">
                <div class="team-header">
                    <h4>${team.name}</h4>
                </div>
                <div class="team-details">
                    <div class="team-member-count">
                        <i class="fas fa-users"></i>
                        <span>${team.member_count || 1} Oyuncu</span>
                    </div>
                    <div class="team-captain">
                        <i class="fas fa-crown"></i>
                        <span>${team.captain_username || 'Kaptan Atanmadı'}</span>
                    </div>
                </div>
                <div class="team-stats">
                    <div class="stat">
                        <span class="stat-value">${team.wins || 0}</span>
                        <span class="stat-label">Galibiyet</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${team.losses || 0}</span>
                        <span class="stat-label">Mağlubiyet</span>
                    </div>
                </div>
            </div>
            <button class="delete-team-btn" data-team-id="${team.id}">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add delete button functionality
        const deleteBtn = teamItem.querySelector('.delete-team-btn');
        deleteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
                fetch(`/team/delete/${team.id}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                })
                    .then(response => {
                        if (response.ok) {
                            teamItem.remove();
                            updateButtonStates();
                        } else {
                            alert('Takım silinirken bir hata oluştu.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Takım silinirken bir hata oluştu.');
                    });
            }
        });

        return teamItem;
    }

    function updateSliderPosition() {
        const cardWidth = document.querySelector('.team-item').offsetWidth + 12; // 12px gap
        const rowWidth = cardWidth * 3; // Width of one row (3 cards)
        teamsList.scrollTo({
            left: currentPair * rowWidth * 2, // Multiply by 2 for two rows
            behavior: 'smooth'
        });
        updateButtonStates();
    }

    function updateButtonStates() {
        const teamItems = document.querySelectorAll('.team-item');
        totalPairs = Math.ceil(teamItems.length / 6); // Since we have 3x2 grid, we need 6 items per page

        // Hide both buttons if there are no teams
        if (teamItems.length === 0) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        // Show/hide prev button based on current position
        prevBtn.style.display = currentPair > 0 ? 'flex' : 'none';

        // Show/hide next button based on whether there are more teams to show
        nextBtn.style.display = currentPair < totalPairs - 1 ? 'flex' : 'none';
    }

    prevBtn.addEventListener('click', () => {
        if (currentPair > 0) {
            currentPair--;
            updateSliderPosition();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPair < totalPairs - 1) {
            currentPair++;
            updateSliderPosition();
        }
    });

    // Function to load teams from backend
    function loadTeams() {
        fetch('/team/get/')
            .then(response => response.json())
            .then(data => {
                teamsList.innerHTML = ''; // Clear existing teams
                // Add team cards
                data['teams'].forEach(team => {
                    const teamCard = createTeamCard(team);
                    teamsList.appendChild(teamCard);
                });
                // Add create team card Last
                const createCard = createNewTeamCard();
                teamsList.appendChild(createCard);
                updateButtonStates();
            })
            .catch(error => {
                console.error('Error loading teams:', error);
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

    teamsBtn.addEventListener('click', function (e) {
        e.preventDefault();
        teamsPopup.style.display = 'block';
        loadTeams();
    });

    closePopup.addEventListener('click', function () {
        teamsPopup.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
        if (e.target === teamsPopup) {
            teamsPopup.style.display = 'none';
        }
    });

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Takım oluşturma formunu dinle
    createTeamForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const teamName = document.getElementById('teamName').value;

        // Send create team request to backend
        fetch('/team/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                name: teamName
            })
        })
        .then(response => response.json())
        .then(team => {
            // Reload Teams
            loadTeams();
            // Takımlarım sekmesine geç
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabPanes = document.querySelectorAll('.tab-pane');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            document.querySelector('[data-tab="my-teams"]').classList.add('active');
            document.getElementById('my-teams').classList.add('active');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Takım oluşturulurken bir hata oluştu.');
        });
    });

    // Add cancel button functionality
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', function() {
        // Clear the form
        createTeamForm.reset();
        // Switch back to my-teams tab
        tabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById('my-teams').classList.add('active');
        // Update tab buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="my-teams"]').classList.add('active');
    });

    // Initial button states
    updateButtonStates();

    // Add delete buttons to existing team cards
    document.querySelectorAll('.team-item').forEach(card => {
        if (!card.querySelector('.delete-team-btn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-team-btn';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
                    card.remove();
                    // Update button states after deletion
                    const nextBtn = document.querySelector('.next-btn');
                    nextBtn.style.opacity =
                        teamsList.scrollLeft < (teamsList.scrollWidth - teamsList.clientWidth) ? '1' : '0.5';
                }
            });
            card.appendChild(deleteBtn);
        }
    });

    // Function to create joinable team item
    function createJoinableTeamItem(team, sent_requests) {
        const teamItem = document.createElement('div');
        teamItem.className = 'joinable-team-item';
        teamItem.innerHTML = `
            <div class="team-info">
                <div class="team-name">
                    <i class="fas fa-users"></i>
                    <span>${team.name}</span>
                </div>
                <div class="team-meta">
                    <span class="member-count">
                        <i class="fas fa-user-friends"></i>
                        ${team.member_count || 1} Oyuncu
                    </span>
                    <span class="captain">
                        <i class="fas fa-crown"></i>
                        ${team.captain_username || 'Kaptan Atanmadı'}
                    </span>
                </div>
            </div>
            <button class="join-team-btn" data-team-id="${team.id}">
                <i class="fas fa-user-plus"></i>
                Katıl
            </button>
        `;

        // Add join button functionality
        const joinBtn = teamItem.querySelector('.join-team-btn');
        if (sent_requests.includes(team.id)) {
            joinBtn.disabled = true;
            joinBtn.innerHTML = '<i class="fas fa-clock"></i> Beklemede';
            joinBtn.classList.add('pending');
        }
        joinBtn.addEventListener('click', function () {
            if (confirm(`${team.name} takımına katılmak istediğinizden emin misiniz?`)) {
                fetch(`/team/join/${team.id}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Katılım isteği gönderildi!');
                            joinBtn.disabled = true;
                            joinBtn.innerHTML = '<i class="fas fa-clock"></i> Beklemede';
                            joinBtn.classList.add('pending');
                        } else {
                            alert(data.message || 'Bir hata oluştu.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('İstek gönderilirken bir hata oluştu.');
                    });
            }
        });

        return teamItem;
    }

    // Function to load joinable teams
    function loadJoinableTeams() {
        const joinableTeamsContainer = document.querySelector('.joinable-teams');
        const searchInput = document.querySelector('.search-container input');
        const searchBtn = document.querySelector('.search-btn');
        let searchTimeout;

        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase();

            // Don't search if less than 3 characters
            if (searchTerm.length < 3) {
                joinableTeamsContainer.innerHTML = `
                    <div class="no-teams-found">
                        <i class="fas fa-info-circle"></i>
                        <p>En az 3 karakter giriniz.</p>
                    </div>
                `;
                return;
            }

            fetch('/team/search/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({
                    search_term: searchTerm
                })
            })
                .then(response => response.json())
                .then(data => {
                    joinableTeamsContainer.innerHTML = '';
                    if (data.teams && data.teams.length > 0) {
                        data.teams.forEach(team => {
                            const teamItem = createJoinableTeamItem(team, data['sent_requests']);
                            joinableTeamsContainer.appendChild(teamItem);
                        });
                    } else {
                        joinableTeamsContainer.innerHTML = `
                        <div class="no-teams-found">
                            <i class="fas fa-search"></i>
                            <p>Arama kriterlerine uygun takım bulunamadı.</p>
                        </div>
                    `;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    joinableTeamsContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Takımlar yüklenirken bir hata oluştu.</p>
                    </div>
                `;
                });
        }

        // Search input handler with debouncing
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 300); // 300ms delay
        });

        // Search button click handler
        searchBtn.addEventListener('click', performSearch);

        // Initial load - show instruction message
        joinableTeamsContainer.innerHTML = `
            <div class="no-teams-found">
                <i class="fas fa-search"></i>
                <p>Takım aramak için en az 3 karakter giriniz.</p>
            </div>
        `;
    }

    // Function to create invite item
    function createInviteItem(invite) {
        const inviteItem = document.createElement('div');
        inviteItem.className = 'invite-item';
        inviteItem.innerHTML = `
            <div class="invite-info">
                <div class="invite-team-name">
                    <i class="fas fa-users"></i>
                    <span>${invite.team_name}</span>
                </div>
                <div class="invite-meta">
                    <span>
                        <i class="fas fa-user-friends"></i>
                        ${invite.member_count || 1} Oyuncu
                    </span>
                    <span>
                        <i class="fas fa-crown"></i>
                        ${invite.captain_username || 'Kaptan Atanmadı'}
                    </span>
                </div>
            </div>
            <div class="invite-actions">
                <button class="accept-invite-btn" data-invite-id="${invite.id}">
                    <i class="fas fa-check"></i>
                    Kabul Et
                </button>
                <button class="decline-invite-btn" data-invite-id="${invite.id}">
                    <i class="fas fa-times"></i>
                    Reddet
                </button>
            </div>
        `;

        // Add accept button functionality
        const acceptBtn = inviteItem.querySelector('.accept-invite-btn');
        acceptBtn.addEventListener('click', function() {
            const inviteId = this.getAttribute('data-invite-id');
            fetch(`/team/invite/accept/${inviteId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    inviteItem.remove();
                    loadInvites(); // Reload invites
                    loadTeams(); // Reload teams
                } else {
                    alert(data.message || 'Bir hata oluştu.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('İstek işlenirken bir hata oluştu.');
            });
        });

        // Add decline button functionality
        const declineBtn = inviteItem.querySelector('.decline-invite-btn');
        declineBtn.addEventListener('click', function() {
            const inviteId = this.getAttribute('data-invite-id');
            fetch(`/team/invite/deny/${inviteId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    inviteItem.remove();
                    loadInvites(); // Reload invites
                } else {
                    alert(data.message || 'Bir hata oluştu.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('İstek işlenirken bir hata oluştu.');
            });
        });

        return inviteItem;
    }

    // Function to load invites
    function loadInvites() {
        const receivedInvites = document.querySelector('.received-invites');
        
        fetch('/user/team_invites/')
            .then(response => response.json())
            .then(data => {
                receivedInvites.innerHTML = '';
                if (data.invites && data.invites.length > 0) {
                    data.invites.forEach(invite => {
                        const inviteItem = createInviteItem(invite);
                        receivedInvites.appendChild(inviteItem);
                    });
                } else {
                    receivedInvites.innerHTML = `
                        <div class="no-invites">
                            <i class="fas fa-envelope-open"></i>
                            <p>Henüz bir davet bulunmuyor.</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading invites:', error);
                receivedInvites.innerHTML = `
                    <div class="no-invites">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Davetler yüklenirken bir hata oluştu.</p>
                    </div>
                `;
            });
    }

    // Add tab change handler to load invites
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'join-team') {
                loadInvites();
                loadJoinableTeams();
            }
        });
    });
});