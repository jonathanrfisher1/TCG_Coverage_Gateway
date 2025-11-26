// Main Event Handlers and Initialization

// Auto-save on any input change
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"]')) {
                saveToLocalStorage();
            }
        });
        
        // Load everything on page load
        window.addEventListener('DOMContentLoaded', () => {
            loadBracketConfig();
            generateBracket();
            loadFromLocalStorage();
            loadSettings();
            updatePlayerPerTeamVisibility();
        });