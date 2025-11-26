// Bracket Configuration Module
const STORAGE_KEY = 'bothanInvitational2_8k';
const SETTINGS_KEY = 'bothanInvitational2_8k_presentationSettings';

let bracketConfig = {
    type: 'teams',
    playersPerTeam: 3,
    bracketSize: 8
};

let winners = {};
let decklists = {};
let logoData = null;

// Load bracket configuration on page load
function loadBracketConfig() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const data = JSON.parse(saved);
        if (data.config) {
            bracketConfig = data.config;
            // Update radio buttons
            document.querySelector(`input[name="tournamentType"][value="${bracketConfig.type}"]`).checked = true;
            document.querySelector(`input[name="playersPerTeam"][value="${bracketConfig.playersPerTeam}"]`).checked = true;
            document.querySelector(`input[name="bracketSize"][value="${bracketConfig.bracketSize}"]`).checked = true;
            updatePlayerPerTeamVisibility();
        }
    }
}

// Update visibility of "Players per Team" option
function updatePlayerPerTeamVisibility() {
    const type = document.querySelector('input[name="tournamentType"]:checked').value;
    const playerConfig = document.getElementById('playersPerTeamConfig');
    playerConfig.style.opacity = type === 'teams' ? '1' : '0.3';
    playerConfig.style.pointerEvents = type === 'teams' ? 'auto' : 'none';
}

// Check if settings have changed
function hasSettingsChanged() {
    const type = document.querySelector('input[name="tournamentType"]:checked').value;
    const playersPerTeam = parseInt(document.querySelector('input[name="playersPerTeam"]:checked').value);
    const bracketSize = parseInt(document.querySelector('input[name="bracketSize"]:checked').value);
    
    return type !== bracketConfig.type || 
           playersPerTeam !== bracketConfig.playersPerTeam || 
           bracketSize !== bracketConfig.bracketSize;
}

function applyBracketSettings() {
    if (hasSettingsChanged()) {
        if (!confirm('⚠️ Changing bracket settings will clear all current data. Continue?')) {
            return;
        }
        
        // Clear all data
        winners = {};
        decklists = {};
    }
    
    // Update configuration
    bracketConfig.type = document.querySelector('input[name="tournamentType"]:checked').value;
    bracketConfig.playersPerTeam = parseInt(document.querySelector('input[name="playersPerTeam"]:checked').value);
    bracketConfig.bracketSize = parseInt(document.querySelector('input[name="bracketSize"]:checked').value);
    
    document.getElementById('settingsWarning').classList.remove('show');
    
    generateBracket();
    saveToLocalStorage();
}
