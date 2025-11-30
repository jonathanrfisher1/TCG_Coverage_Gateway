// LocalStorage Management Module

function saveToLocalStorage() {
            const data = {
                config: bracketConfig,
                winners: winners,
                decklists: decklists,
                logoData: logoData,
                timestamp: new Date().toISOString()
            };
            
            const inputs = {};
            document.querySelectorAll('input[type="text"]').forEach(input => {
                if (input.id) inputs[input.id] = input.value;
            });
            data.inputs = inputs;
            
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                showSaveConfirmation();
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    alert('⚠️ Storage limit exceeded! Logo file may be too large.');
                }
            }
        }
        
        function showSaveConfirmation() {
            const elem = document.getElementById('saveConfirmation');
            elem.classList.add('show');
            setTimeout(() => elem.classList.remove('show'), 3000);
        }
        
        function loadFromLocalStorage() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (!saved) return false;
                
                const data = JSON.parse(saved);
                
                if (data.winners) {
                    Object.assign(winners, data.winners);
                }
                
                if (data.decklists) {
                    Object.assign(decklists, data.decklists);
                }
                
                if (data.logoData) {
                    logoData = data.logoData;
                    const logoBtn = document.getElementById('logoBtn');
                    logoBtn.innerHTML = '✓ Logo Loaded';
                    document.querySelector('button[onclick*="logoUpload"]').style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                }
                
                if (data.inputs) {
                    Object.entries(data.inputs).forEach(([id, value]) => {
                        const input = document.getElementById(id);
                        if (input) input.value = value;
                    });
                }
                
                // Update UI after loading
                setTimeout(() => {
                    updateWinnerButtons();
                    updateDecklistInputs();
                }, 100);
                
                console.log('✓ Loaded from localStorage');
                return true;
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
                return false;
            }
        }
        
        function updateWinnerButtons() {
            Object.entries(winners).forEach(([match, winner]) => {
                if (winner !== undefined) {
                    const btns = document.querySelectorAll(`button[onclick="markWinner('${match}', ${winner})"]`);
                    btns.forEach(btn => btn.classList.add('selected'));
                }
            });
        }
        
        function updateDecklistInputs() {
            Object.entries(decklists).forEach(([playerId, url]) => {
                const input = document.getElementById(playerId + '-decklist');
                if (input && url) {
                    input.value = url;
                    input.classList.add('has-url');
                }
            });
        }
        
        function exportBracketData() {
            const data = {
                config: bracketConfig,
                winners: winners,
                decklists: decklists,
                logoData: logoData,
                exportDate: new Date().toISOString(),
                tournamentName: document.getElementById('tournamentTitle')?.value || 'Tournament Bracket'
            };
            
            const inputs = {};
            document.querySelectorAll('input[type="text"]').forEach(input => {
                if (input.id) inputs[input.id] = input.value;
            });
            data.inputs = inputs;
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bracket_${bracketConfig.type}_${bracketConfig.bracketSize}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✓ Bracket data exported successfully!');
        }
        
        function importBracketData(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Check if this is a legacy format (uses qf1, sf1, etc.)
                    const isLegacyFormat = data.inputs && Object.keys(data.inputs).some(key => 
                        key.startsWith('qf') || key.startsWith('sf') || key.startsWith('final')
                    );
                    
                    // Auto-detect and set configuration for legacy format
                    if (isLegacyFormat && !data.config) {
                        // Detect bracket size from the data
                        const hasQF = Object.keys(data.inputs).some(key => key.startsWith('qf'));
                        const hasSF = Object.keys(data.inputs).some(key => key.startsWith('sf'));
                        
                        // Detect players per team
                        const hasP3 = Object.keys(data.inputs).some(key => key.includes('-p3-'));
                        
                        bracketConfig.type = 'teams';
                        bracketConfig.playersPerTeam = hasP3 ? 3 : 2;
                        bracketConfig.bracketSize = hasQF ? 8 : (hasSF ? 4 : 2);
                        
                        // Update UI
                        document.querySelector(`input[name="tournamentType"][value="teams"]`).checked = true;
                        document.querySelector(`input[name="playersPerTeam"][value="${bracketConfig.playersPerTeam}"]`).checked = true;
                        document.querySelector(`input[name="bracketSize"][value="${bracketConfig.bracketSize}"]`).checked = true;
                        updatePlayerPerTeamVisibility();
                        generateBracket();
                    } else if (data.config) {
                        // Use provided configuration
                        bracketConfig = data.config;
                        document.querySelector(`input[name="tournamentType"][value="${bracketConfig.type}"]`).checked = true;
                        document.querySelector(`input[name="playersPerTeam"][value="${bracketConfig.playersPerTeam}"]`).checked = true;
                        document.querySelector(`input[name="bracketSize"][value="${bracketConfig.bracketSize}"]`).checked = true;
                        updatePlayerPerTeamVisibility();
                        generateBracket();
                    }
                    
                    // Handle legacy format translation
                    if (isLegacyFormat) {
                        console.log('Detected legacy format, translating...');
                        const translated = translateLegacyFormat(data);
                        
                        if (translated.winners) {
                            winners = translated.winners;
                        }
                        
                        if (translated.decklists) {
                            decklists = translated.decklists;
                        }
                        
                        if (translated.inputs) {
                            setTimeout(() => {
                                Object.entries(translated.inputs).forEach(([id, value]) => {
                                    const input = document.getElementById(id);
                                    if (input) {
                                        input.value = value;
                                        console.log(`Set ${id} = ${value}`);
                                    } else {
                                        console.log(`Input not found: ${id}`);
                                    }
                                });
                                updateWinnerButtons();
                                updateDecklistInputs();
                            }, 200);
                        }
                    } else {
                        // Standard format
                        if (data.winners) {
                            winners = data.winners;
                        }
                        
                        if (data.decklists) {
                            decklists = data.decklists;
                        }
                        
                        if (data.inputs) {
                            setTimeout(() => {
                                Object.entries(data.inputs).forEach(([id, value]) => {
                                    const input = document.getElementById(id);
                                    if (input) input.value = value;
                                });
                                updateWinnerButtons();
                                updateDecklistInputs();
                            }, 100);
                        }
                    }
                    
                    if (data.logoData) {
                        logoData = data.logoData;
                        const logoBtn = document.getElementById('logoBtn');
                        logoBtn.innerHTML = '✓ Logo Loaded';
                        document.querySelector('button[onclick*="logoUpload"]').style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                    }
                    
                    saveToLocalStorage();
                    alert('✓ Bracket data imported successfully!');
                } catch (err) {
                    alert('✗ Failed to import data. Make sure the file is valid JSON.');
                    console.error(err);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
        
        function translateLegacyFormat(data) {
            // Map legacy match IDs to new format
            // For 8-team bracket: qf1-4 -> r0m0-3, sf1-2 -> r1m0-1, final -> r2m0
            const matchMap = {
                'qf1': 'r0m0',
                'qf2': 'r0m1',
                'qf3': 'r0m2',
                'qf4': 'r0m3',
                'sf1': 'r1m0',
                'sf2': 'r1m1',
                'final': 'r2m0'
            };
            
            const translated = {
                winners: {},
                decklists: {},
                inputs: {}
            };
            
            // Translate winners
            if (data.winners) {
                Object.entries(data.winners).forEach(([oldKey, value]) => {
                    const newKey = matchMap[oldKey];
                    if (newKey) {
                        translated.winners[newKey] = value;
                    }
                });
            }
            
            // Translate decklists - handle both old format (with filename/type) and new format (just URL string)
            if (data.decklists) {
                Object.entries(data.decklists).forEach(([oldKey, value]) => {
                    // Translate the key from qf1-t1-p1 to r0m0t0p0
                    const newKey = translatePlayerKey(oldKey, matchMap);
                    if (newKey) {
                        // Handle both formats
                        if (typeof value === 'object' && value.filename) {
                            translated.decklists[newKey] = value.filename;
                        } else if (typeof value === 'string') {
                            translated.decklists[newKey] = value;
                        }
                    }
                });
            }
            
            // Translate input field IDs
            if (data.inputs) {
                Object.entries(data.inputs).forEach(([oldKey, value]) => {
                    const newKey = translateInputKey(oldKey, matchMap);
                    if (newKey) {
                        translated.inputs[newKey] = value;
                    }
                });
            }
            
            return translated;
        }
        
        function translatePlayerKey(oldKey, matchMap) {
            // Convert qf1-t1-p1 to r0m0t0p0
            for (const [oldMatch, newMatch] of Object.entries(matchMap)) {
                if (oldKey.startsWith(oldMatch)) {
                    const rest = oldKey.substring(oldMatch.length);
                    // rest will be like "-t1-p1" or "-t2-p3"
                    const transformed = rest
                        .replace(/-t1-/g, 't0-')
                        .replace(/-t2-/g, 't1-')
                        .replace(/-t1$/g, 't0')  // Handle end of string
                        .replace(/-t2$/g, 't1')  // Handle end of string
                        .replace(/-p1$/g, 'p0')  // Handle end of string
                        .replace(/-p2$/g, 'p1')  // Handle end of string
                        .replace(/-p3$/g, 'p2'); // Handle end of string
                    return newMatch + transformed;
                }
            }
            return null;
        }
        
        function translateInputKey(oldKey, matchMap) {
            // Convert qf1-t1-p1-name to r0m0t0p0-name
            // Also handle qf1-t1-name and final-t1-name
            
            for (const [oldMatch, newMatch] of Object.entries(matchMap)) {
                if (oldKey.startsWith(oldMatch)) {
                    const rest = oldKey.substring(oldMatch.length);
                    // rest will be like "-t1-name" or "-t1-p1-leader" or "-t2-p3-base"
                    const transformed = rest
                        .replace(/-t1-/g, 't0-')
                        .replace(/-t2-/g, 't1-')
                        .replace(/-t1$/g, 't0')  // Handle end of string
                        .replace(/-t2$/g, 't1')  // Handle end of string
                        .replace(/-p1-/g, 'p0-')
                        .replace(/-p2-/g, 'p1-')
                        .replace(/-p3-/g, 'p2-');
                    return newMatch + transformed;
                }
            }
            
            // Handle special cases like "champ-name"
            if (oldKey === 'champ-name') {
                return null; // Skip this for now
            }
            
            return null;
        }
        
        function clearResults() {
            if (!confirm('🔄 Clear all winner selections? (Teams/players and decklists will be kept)')) {
                return;
            }
            
            winners = {};
            
            saveToLocalStorage();
            generateBracket();
            loadFromLocalStorage();
            
            alert('✓ Results cleared! Team/player data and decklists preserved.');
        }
        
        function clearAllData() {
            if (!confirm('⚠️ Are you sure you want to clear ALL bracket data? This cannot be undone!')) {
                return;
            }
            
            winners = {};
            decklists = {};
            logoData = null;
            
            saveToLocalStorage();
            generateBracket();
            
            const logoBtn = document.getElementById('logoBtn');
            if (logoBtn) {
                logoBtn.innerHTML = '🖼️ Select Logo';
            }
            const logoUploadBtn = document.querySelector('button[onclick*="logoUpload"]');
            if (logoUploadBtn) {
                logoUploadBtn.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
            }
            
            alert('✓ All data cleared!');
        }
        
        // Presentation Settings Functions
        function toggleSettings() {
            const panel = document.getElementById('settingsPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        
        function updateSettingValue(id, value) {
            document.getElementById(id + 'Value').textContent = value;
        }
        
        function saveSettings() {
            const settings = {
                tournamentTitle: document.getElementById('tournamentTitle').value,
                logoSize: document.getElementById('logoSize').value,
                matchSpacing: document.getElementById('matchSpacing').value,
                roundGap: document.getElementById('roundGap').value,
                teamNameSize: document.getElementById('teamNameSize').value,
                playerNameSize: document.getElementById('playerNameSize').value,
                deckInfoSize: document.getElementById('deckInfoSize').value,
                matchOpacity: document.getElementById('matchOpacity').value,
                borderOpacity: document.getElementById('borderOpacity').value,
                matchWidth: document.getElementById('matchWidth').value,
                matchPadding: document.getElementById('matchPadding').value,
                cornerRadius: document.getElementById('cornerRadius').value
            };
            
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            updatePageTitle(settings.tournamentTitle);
            alert('✓ Presentation settings saved!');
        }
        
        function loadSettings() {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (!saved) return;
            
            const settings = JSON.parse(saved);
            Object.entries(settings).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                    if (key !== 'tournamentTitle') {
                        const unit = key.includes('Opacity') ? '' : 'px';
                        updateSettingValue(key, value + unit);
                    }
                }
            });
            
            // Update page title if tournament title is set
            if (settings.tournamentTitle) {
                updatePageTitle(settings.tournamentTitle);
            }
        }
        
        function updatePageTitle(title) {
            const pageTitle = document.getElementById('pageTitle');
            const browserTitle = document.querySelector('title');
            
            if (title && title.trim()) {
                if (pageTitle) pageTitle.textContent = `🏆 ${title}`;
                if (browserTitle) browserTitle.textContent = `${title} - Bracket Manager`;
            } else {
                if (pageTitle) pageTitle.textContent = '🏆 Bracket Manager';
                if (browserTitle) browserTitle.textContent = 'Bracket Manager';
            }
        }
        
        function resetSettings() {
            if (!confirm('Reset all presentation settings to defaults?')) return;
            
            document.getElementById('tournamentTitle').value = 'Tournament Bracket';
            document.getElementById('logoSize').value = 100;
            document.getElementById('matchSpacing').value = 20;
            document.getElementById('roundGap').value = 40;
            document.getElementById('teamNameSize').value = 16;
            document.getElementById('playerNameSize').value = 13;
            document.getElementById('deckInfoSize').value = 11;
            document.getElementById('matchOpacity').value = 0.85;
            document.getElementById('borderOpacity').value = 0.4;
            document.getElementById('matchWidth').value = 260;
            document.getElementById('matchPadding').value = 12;
            document.getElementById('cornerRadius').value = 10;
            
            updatePageTitle('Tournament Bracket');
            updateSettingValue('logoSize', '100px');
            updateSettingValue('matchSpacing', '20px');
            updateSettingValue('roundGap', '40px');
            updateSettingValue('teamNameSize', '16px');
            updateSettingValue('playerNameSize', '13px');
            updateSettingValue('deckInfoSize', '11px');
            updateSettingValue('matchOpacity', '0.85');
            updateSettingValue('borderOpacity', '0.4');
            updateSettingValue('matchWidth', '260px');
            updateSettingValue('matchPadding', '12px');
            updateSettingValue('cornerRadius', '10px');
            
            localStorage.removeItem(SETTINGS_KEY);
            alert('✓ Settings reset to defaults!');
        }
