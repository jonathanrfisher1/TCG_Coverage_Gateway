// Bracket Generator Module

function generateBracket() {
            const container = document.getElementById('editorContainer');
            container.innerHTML = '';
            
            const { type, playersPerTeam, bracketSize } = bracketConfig;
            const rounds = Math.log2(bracketSize);
            const roundsRow = document.createElement('div');
            roundsRow.className = 'rounds-row';
            
            // Generate each round
            for (let round = 0; round < rounds; round++) {
                const matchesInRound = bracketSize / Math.pow(2, round + 1);
                const section = document.createElement('div');
                section.className = 'section';
                
                const roundName = getRoundName(round, rounds);
                section.innerHTML = `<div class="section-title">${roundName}</div>`;
                
                // Generate matches in this round
                for (let match = 0; match < matchesInRound; match++) {
                    const matchDiv = createMatch(round, match);
                    section.appendChild(matchDiv);
                }
                
                roundsRow.appendChild(section);
            }
            
            container.appendChild(roundsRow);
        }
        
        function getRoundName(round, totalRounds) {
            const { bracketSize } = bracketConfig;
            
            if (round === totalRounds - 1) return 'Finals';
            if (round === totalRounds - 2) return 'Semi Finals';
            if (bracketSize === 16 && round === totalRounds - 3) return 'Quarter Finals';
            if (bracketSize === 8 && round === totalRounds - 3) return 'Quarter Finals';
            
            return `Round ${round + 1}`;
        }
        
        function createMatch(round, matchNum) {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            
            const matchId = `r${round}m${matchNum}`;
            matchDiv.innerHTML = `<div class="match-label">Match ${matchNum + 1}</div>`;
            
            // Create container for horizontal team layout
            const teamsContainer = document.createElement('div');
            teamsContainer.className = 'match-teams';
            
            // Create two teams/players
            for (let team = 0; team < 2; team++) {
                const teamDiv = createTeamOrPlayer(round, matchNum, team);
                teamsContainer.appendChild(teamDiv);
                
                if (team === 0) {
                    const vs = document.createElement('div');
                    vs.className = 'vs';
                    vs.textContent = 'VS';
                    teamsContainer.appendChild(vs);
                }
            }
            
            matchDiv.appendChild(teamsContainer);
            return matchDiv;
        }
        
        function createTeamOrPlayer(round, matchNum, teamNum) {
            const { type, playersPerTeam } = bracketConfig;
            const matchId = `r${round}m${matchNum}`;
            const teamId = `${matchId}t${teamNum}`;
            
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team';
            
            let html = '';
            
            if (type === 'teams') {
                html += `<input type="text" id="${teamId}-name" placeholder="Team Name" oninput="saveToLocalStorage()">`;
                
                for (let p = 0; p < playersPerTeam; p++) {
                    const playerId = `${teamId}p${p}`;
                    html += `<div class="player-label">Player ${p + 1}</div>`;
                    html += `<div class="player-inputs">
                        <input type="text" id="${playerId}-name" placeholder="Player Name" oninput="saveToLocalStorage()">
                        <input type="text" id="${playerId}-leader" placeholder="Leader" oninput="saveToLocalStorage()">
                        <input type="text" id="${playerId}-base" placeholder="Base" oninput="saveToLocalStorage()">
                    </div>`;
                    html += `<label class="upload-btn" id="${playerId}-btn" for="${playerId}-file">📎 Decklist</label>`;
                    html += `<input type="file" id="${playerId}-file" accept=".pdf,.jpg,.jpeg,.png" onchange="handleDecklistUpload(event, '${playerId}')">`;
                }
            } else {
                // Singles mode - just one player
                const playerId = teamId;
                html += `<input type="text" id="${playerId}-name" placeholder="Player Name" oninput="saveToLocalStorage()">`;
                html += `<div class="player-inputs">
                    <input type="text" id="${playerId}-leader" placeholder="Leader" oninput="saveToLocalStorage()" style="grid-column: 1/2;">
                    <input type="text" id="${playerId}-base" placeholder="Base" oninput="saveToLocalStorage()" style="grid-column: 2/4;">
                </div>`;
                html += `<label class="upload-btn" id="${playerId}-btn" for="${playerId}-file">📎 Decklist</label>`;
                html += `<input type="file" id="${playerId}-file" accept=".pdf,.jpg,.jpeg,.png" onchange="handleDecklistUpload(event, '${playerId}')">`;
            }
            
            html += `<button class="winner-btn" onclick="markWinner('${matchId}', ${teamNum})">${type === 'teams' ? 'Team' : 'Player'} ${teamNum + 1} Wins</button>`;
            
            teamDiv.innerHTML = html;
            return teamDiv;
        }
        
        function handleDecklistUpload(event, playerId) {
            const file = event.target.files[0];
            if (!file) return;
            
            decklists[playerId] = file.name;
            
            const btn = document.getElementById(playerId + '-btn');
            btn.classList.add('has-file');
            btn.textContent = '✓ ' + file.name;
            
            saveToLocalStorage();
        }
        
        function handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Store actual filename as relative path
            logoData = `./${file.name}`;
            
            const logoBtn = document.getElementById('logoBtn');
            logoBtn.innerHTML = '✓ Logo Loaded: ' + file.name;
            document.querySelector('button[onclick*="logoUpload"]').style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            saveToLocalStorage();
        }
        
        function markWinner(matchId, winnerTeam) {
            const round = parseInt(matchId.substring(1, matchId.indexOf('m')));
            const matchNum = parseInt(matchId.substring(matchId.indexOf('m') + 1));
            
            // Toggle selection
            if (winners[matchId] === winnerTeam) {
                delete winners[matchId];
                document.querySelectorAll(`button[onclick="markWinner('${matchId}', 0)"], button[onclick="markWinner('${matchId}', 1)"]`).forEach(btn => {
                    btn.classList.remove('selected');
                });
            } else {
                winners[matchId] = winnerTeam;
                document.querySelectorAll(`button[onclick="markWinner('${matchId}', 0)"], button[onclick="markWinner('${matchId}', 1)"]`).forEach(btn => {
                    btn.classList.remove('selected');
                });
                document.querySelectorAll(`button[onclick="markWinner('${matchId}', ${winnerTeam})"]`).forEach(btn => {
                    btn.classList.add('selected');
                });
                
                // Auto-advance winner to next round
                advanceWinner(round, matchNum, winnerTeam);
            }
            
            saveToLocalStorage();
        }
        
        function advanceWinner(round, matchNum, winnerTeam) {
            const { type, playersPerTeam } = bracketConfig;
            const totalRounds = Math.log2(bracketConfig.bracketSize);
            
            if (round >= totalRounds - 1) return; // Finals winner doesn't advance
            
            const nextRound = round + 1;
            const nextMatch = Math.floor(matchNum / 2);
            const nextTeam = matchNum % 2;
            
            const sourceTeamId = `r${round}m${matchNum}t${winnerTeam}`;
            const targetTeamId = `r${nextRound}m${nextMatch}t${nextTeam}`;
            
            if (type === 'teams') {
                // Copy team name
                const teamName = document.getElementById(`${sourceTeamId}-name`)?.value || '';
                const targetTeamInput = document.getElementById(`${targetTeamId}-name`);
                if (targetTeamInput) targetTeamInput.value = teamName;
                
                // Copy all players
                for (let p = 0; p < playersPerTeam; p++) {
                    const sourcePlayer = `${sourceTeamId}p${p}`;
                    const targetPlayer = `${targetTeamId}p${p}`;
                    
                    ['name', 'leader', 'base'].forEach(field => {
                        const source = document.getElementById(`${sourcePlayer}-${field}`)?.value || '';
                        const target = document.getElementById(`${targetPlayer}-${field}`);
                        if (target) target.value = source;
                    });
                    
                    // Copy decklist reference
                    if (decklists[sourcePlayer]) {
                        decklists[targetPlayer] = decklists[sourcePlayer];
                        const btn = document.getElementById(targetPlayer + '-btn');
                        if (btn) {
                            btn.classList.add('has-file');
                            btn.textContent = '✓ ' + decklists[sourcePlayer];
                        }
                    }
                }
            } else {
                // Singles mode - copy single player
                ['name', 'leader', 'base'].forEach(field => {
                    const source = document.getElementById(`${sourceTeamId}-${field}`)?.value || '';
                    const target = document.getElementById(`${targetTeamId}-${field}`);
                    if (target) target.value = source;
                });
                
                if (decklists[sourceTeamId]) {
                    decklists[targetTeamId] = decklists[sourceTeamId];
                    const btn = document.getElementById(targetTeamId + '-btn');
                    if (btn) {
                        btn.classList.add('has-file');
                        btn.textContent = '✓ ' + decklists[sourceTeamId];
                    }
                }
            }
        }