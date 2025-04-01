function toggleEvaluation() {
    const popup = document.getElementById('evaluationPopup');
    popup.classList.toggle('show');
}

// Close popup when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('evaluationPopup');
    
    window.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
});

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
