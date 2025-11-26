// Presentation Mode Module

function openPresentation() {
            const presentationHTML = generatePresentationHTML();
            const blob = new Blob([presentationHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank', 'width=1920,height=1080');
        }
        
        function downloadPresentation() {
            const presentationHTML = generatePresentationHTML();
            const blob = new Blob([presentationHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tournament_bracket_${new Date().toISOString().split('T')[0]}.html`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✓ Presentation HTML downloaded! Place PDF/image files in ./decklists/ folder relative to the HTML file.');
        }
        
        function generatePresentationHTML() {
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
            const { type, playersPerTeam, bracketSize } = bracketConfig;
            const totalRounds = Math.log2(bracketSize);
            
            // Get tournament title from settings or use default
            const tournamentTitle = settings.tournamentTitle || 'Tournament Bracket';
            
            // Adjust settings based on bracket size
            const isLargeBracket = bracketSize === 16;
            const logoSize = isLargeBracket ? (settings.logoSize || 80) : (settings.logoSize || 100);
            const matchSpacing = isLargeBracket ? (settings.matchSpacing || 12) : (settings.matchSpacing || 20);
            const roundGap = isLargeBracket ? (settings.roundGap || 12) : (settings.roundGap || 40);
            const teamNameSize = settings.teamNameSize || 16;
            const playerNameSize = settings.playerNameSize || 13;
            const deckInfoSize = settings.deckInfoSize || 11;
            const matchOpacity = settings.matchOpacity || 0.85;
            const borderOpacity = settings.borderOpacity || 0.4;
            const matchWidth = settings.matchWidth || 260;
            const matchPadding = isLargeBracket ? (settings.matchPadding || 10) : (settings.matchPadding || 12);
            const cornerRadius = settings.cornerRadius || 10;
            
            if (isLargeBracket) {
                return generate16PlayerGrid();
            } else {
                return generateTraditionalBracket();
            }
            
            function generateMatchContent(round, matchNum) {
                const matchId = `r${round}m${matchNum}`;
                const winnerTeam = winners[matchId];
                
                let html = '<div class="match-teams">';
                
                for (let team = 0; team < 2; team++) {
                    const teamId = `${matchId}t${team}`;
                    const isWinner = winnerTeam === team;
                    
                    html += `<div class="team${isWinner ? ' winner' : ''}">`;
                    
                    if (type === 'teams') {
                        const teamName = document.getElementById(`${teamId}-name`)?.value || `Team ${team + 1}`;
                        html += `<div class="team-name">${teamName}</div>`;
                        
                        for (let p = 0; p < playersPerTeam; p++) {
                            const playerId = `${teamId}p${p}`;
                            const playerName = document.getElementById(`${playerId}-name`)?.value || '';
                            const leader = document.getElementById(`${playerId}-leader`)?.value || '';
                            const base = document.getElementById(`${playerId}-base`)?.value || '';
                            const decklistFile = decklists[playerId];
                            
                            if (playerName || leader || base) {
                                const deckInfo = (leader && base) ? `${leader} / ${base}` : (leader || base);
                                
                                html += `<div class="player${decklistFile ? ' has-decklist' : ''}" ${decklistFile ? `onclick="openDecklist('./decklists/${decklistFile}')"` : ''}>`;
                                html += `<span class="player-compact">${playerName}${deckInfo ? ' • ' + deckInfo : ''}</span>`;
                                html += '</div>';
                            }
                        }
                    } else {
                        const playerName = document.getElementById(`${teamId}-name`)?.value || `Player ${team + 1}`;
                        const leader = document.getElementById(`${teamId}-leader`)?.value || '';
                        const base = document.getElementById(`${teamId}-base`)?.value || '';
                        const decklistFile = decklists[teamId];
                        
                        html += `<div class="team-name">${playerName}</div>`;
                        const deckInfo = (leader && base) ? `${leader} / ${base}` : (leader || base);
                        
                        if (deckInfo || decklistFile) {
                            html += `<div class="player${decklistFile ? ' has-decklist' : ''}" ${decklistFile ? `onclick="openDecklist('./decklists/${decklistFile}')"` : ''}>`;
                            html += `<span class="player-compact">${deckInfo}</span>`;
                            html += '</div>';
                        }
                    }
                    
                    html += '</div>';
                    
                    if (team === 0) {
                        html += '<div class="vs">VS</div>';
                    }
                }
                
                html += '</div>'; // Close match-teams
                return html;
            }
            
            function generate16PlayerGrid() {
                const logoHTML = logoData ? `<img src="${logoData}" alt="Logo" class="logo">` : '';
                
                // Generate left wing (Round 1: matches 0-3)
                let leftWingHTML = '';
                for (let match = 0; match < 4; match++) {
                    leftWingHTML += `
                        <div class="match">
                            <div class="round-label">Round 1</div>
                            ${generateMatchContent(0, match)}
                        </div>`;
                }
                
                // Generate right wing (Round 1: matches 4-7)
                let rightWingHTML = '';
                for (let match = 4; match < 8; match++) {
                    rightWingHTML += `
                        <div class="match">
                            <div class="round-label">Round 1</div>
                            ${generateMatchContent(0, match)}
                        </div>`;
                }
                
                // Generate center grid matches
                const qf1 = generateMatchContent(1, 0);
                const qf2 = generateMatchContent(1, 1);
                const qf3 = generateMatchContent(1, 2);
                const qf4 = generateMatchContent(1, 3);
                const sf1 = generateMatchContent(2, 0);
                const sf2 = generateMatchContent(2, 1);
                const finals = generateMatchContent(3, 0);
                
                return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournamentTitle} - Tournament Bracket</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Rajdhani', sans-serif;
            background: linear-gradient(135deg, #0a1628, #1a2942);
            color: #fff;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: auto;
        }
        
        .bracket-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${roundGap}px;
            width: 100%;
            max-width: 1900px;
        }
        
        .round1-wing {
            display: flex;
            flex-direction: column;
            gap: ${matchSpacing}px;
            justify-content: center;
            min-width: 280px;
        }
        
        .bracket-center {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: auto auto auto auto;
            gap: ${matchSpacing}px;
            flex: 1;
            max-width: 1100px;
        }
        
        .match {
            background: rgba(26, 41, 66, ${matchOpacity});
            border: 2px solid rgba(92, 184, 209, ${borderOpacity});
            border-radius: ${cornerRadius}px;
            padding: ${matchPadding}px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            transition: all 0.3s;
        }
        
        .round1-wing .match {
            padding: ${matchPadding}px;
        }
        
        .bracket-center .match {
            padding: ${Math.max(8, matchPadding - 1)}px;
        }
        
        .match:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(92, 184, 209, 0.3);
            border-color: rgba(92, 184, 209, 0.8);
        }
        
        .round-label {
            color: #5cb8d1;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .match-teams {
            display: flex;
            gap: 8px;
            align-items: stretch;
        }
        
        .team {
            padding: ${type === 'teams' ? '8px' : '8px'};
            background: rgba(45, 74, 110, 0.3);
            border-radius: ${Math.max(0, cornerRadius - 4)}px;
            transition: all 0.3s;
            flex: 1;
        }
        
        .team.winner {
            background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2));
            border: 2px solid rgba(46, 204, 113, 0.6);
            box-shadow: 0 0 15px rgba(46, 204, 113, 0.2);
        }
        
        .team-name {
            color: #5cb8d1;
            font-size: ${teamNameSize}px;
            font-weight: 700;
            margin-bottom: ${type === 'teams' ? '5px' : '4px'};
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            line-height: 1.3;
        }
        
        .team.winner .team-name {
            color: #2ecc71;
            text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }
        
        .player {
            background: rgba(26, 41, 66, 0.5);
            border-radius: ${Math.max(0, cornerRadius - 6)}px;
            padding: 5px;
            margin-bottom: 4px;
        }
        
        .player:last-child {
            margin-bottom: 0;
        }
        
        .player-name {
            color: #fff;
            font-size: ${playerNameSize}px;
            font-weight: 600;
            margin-bottom: 3px;
            line-height: 1.3;
        }
        
        .deck-info {
            display: flex;
            gap: 8px;
            color: #8ec9dc;
            font-size: ${deckInfoSize}px;
            flex-wrap: wrap;
            font-weight: 600;
        }
        
        .deck-info span {
            display: inline-flex;
            align-items: center;
            gap: 3px;
        }
        
        .decklist-link {
            color: #5cb8d1;
            text-decoration: none;
            font-size: ${deckInfoSize}px;
            display: inline-flex;
            align-items: center;
            gap: 3px;
            margin-top: 3px;
            transition: color 0.2s;
        }
        
        .decklist-link:hover {
            color: #2ecc71;
            text-decoration: underline;
        }
        
        .vs {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5cb8d1;
            font-size: 11px;
            font-weight: 700;
            opacity: 0.6;
            min-width: 40px;
        }
        
        .title-section {
            background: transparent;
            border: none;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            grid-column: 1 / 5;
            grid-row: 1;
        }
        
        .title-section .logo {
            width: ${logoSize}px;
            height: ${logoSize}px;
            margin-bottom: 8px;
            filter: drop-shadow(0 0 15px rgba(92, 184, 209, 0.5));
        }
        
        .title-section h1 {
            color: #5cb8d1;
            font-size: 28px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 20px rgba(92, 184, 209, 0.6);
            margin-bottom: 4px;
            line-height: 1.1;
        }
        
        .title-section .subtitle {
            color: #8ec9dc;
            font-size: 13px;
            font-weight: 400;
        }
        
        .finals-container {
            grid-column: 2 / 4;
            grid-row: 4;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .finals {
            background: rgba(26, 41, 66, ${matchOpacity});
            border: 3px solid rgba(255, 215, 0, 0.6);
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.3);
            max-width: 280px;
            margin: 0 auto;
        }
        
        .finals .round-label {
            color: #ffd700;
            font-size: 13px;
            text-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
        }
        
        .qf-1 { grid-column: 1; grid-row: 2; }
        .qf-4 { grid-column: 4; grid-row: 2; }
        .sf-1 { grid-column: 2; grid-row: 3; }
        .sf-2 { grid-column: 3; grid-row: 3; }
        .qf-2 { grid-column: 1; grid-row: 4; }
        .qf-3 { grid-column: 4; grid-row: 4; }
        
        @media print {
            body { background: white; color: black; }
            .match { border-color: #333; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="bracket-container">
        <div class="round1-wing">
            ${leftWingHTML}
        </div>
        
        <div class="bracket-center">
            <div class="title-section">
                ${logoHTML}
                <h1>${tournamentTitle}</h1>
                <div class="subtitle">${type === 'teams' ? 'Teams' : 'Individual'} • ${bracketSize} ${type === 'teams' ? 'Teams' : 'Players'}</div>
            </div>
            
            <div class="match qf-1">
                <div class="round-label">Quarter Finals</div>
                ${qf1}
            </div>
            
            <div class="match qf-4">
                <div class="round-label">Quarter Finals</div>
                ${qf4}
            </div>
            
            <div class="match sf-1">
                <div class="round-label">Semi Finals</div>
                ${sf1}
            </div>
            
            <div class="match sf-2">
                <div class="round-label">Semi Finals</div>
                ${sf2}
            </div>
            
            <div class="match qf-2">
                <div class="round-label">Quarter Finals</div>
                ${qf2}
            </div>
            
            <div class="finals-container">
                <div class="match finals">
                    <div class="round-label">⭐ Finals ⭐</div>
                    ${finals}
                </div>
            </div>
            
            <div class="match qf-3">
                <div class="round-label">Quarter Finals</div>
                ${qf3}
            </div>
        </div>
        
        <div class="round1-wing">
            ${rightWingHTML}
        </div>
    </div>
</body>
</html>`;
            }
            
            function generateTraditionalBracket() {
                // Traditional layout for 4 and 8-player brackets
                const logoHTML = logoData ? `<img src="${logoData}" alt="Logo" class="logo">` : '';
                
                let leftWingHTML = '';
                for (let round = 0; round < totalRounds - 1; round++) {
                    const matchesInRound = bracketSize / Math.pow(2, round + 1);
                    const halfMatches = matchesInRound / 2;
                    const verticalSpacing = 15; // Fixed small gap instead of scaling
                    
                    leftWingHTML += `<div class="round" style="gap: ${verticalSpacing}px;">`;
                    leftWingHTML += `<div class="matches-column">`;
                    
                    for (let match = 0; match < halfMatches; match++) {
                        leftWingHTML += generatePresentationMatch(round, match);
                    }
                    
                    leftWingHTML += `</div></div>`;
                }
                
                const finalsRound = totalRounds - 1;
                const centerHTML = `
                    <div class="center-section">
                        <div class="header">
                            ${logoHTML}
                            <h1>${tournamentTitle}</h1>
                            <div class="subtitle">${type === 'teams' ? 'Teams' : 'Individual'} • ${bracketSize} ${type === 'teams' ? 'Teams' : 'Players'}</div>
                        </div>
                        <div class="round finals-round">
                            <div class="matches-column">
                                ${generatePresentationMatch(finalsRound, 0)}
                            </div>
                        </div>
                    </div>
                `;
                
                let rightWingHTML = '';
                for (let round = totalRounds - 2; round >= 0; round--) {
                    const matchesInRound = bracketSize / Math.pow(2, round + 1);
                    const halfMatches = matchesInRound / 2;
                    const verticalSpacing = 15; // Fixed small gap instead of scaling
                    
                    rightWingHTML += `<div class="round" style="gap: ${verticalSpacing}px;">`;
                    rightWingHTML += `<div class="matches-column">`;
                    
                    for (let match = halfMatches; match < matchesInRound; match++) {
                        rightWingHTML += generatePresentationMatch(round, match);
                    }
                    
                    rightWingHTML += `</div></div>`;
                }
                
                return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournamentTitle} - Tournament Bracket</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Rajdhani', sans-serif;
            background: linear-gradient(135deg, #0a1628, #1a2942);
            color: #fff;
            padding: 10px;
            min-height: 100vh;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .bracket-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: ${Math.max(15, roundGap - 20)}px;
            width: fit-content;
            max-width: 100%;
            margin: 0 auto;
        }
        
        .left-wing, .right-wing {
            display: flex;
            gap: ${roundGap}px;
            align-items: center;
        }
        
        .center-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 30px;
            align-self: center;
        }
        
        .header {
            text-align: center;
        }
        
        .logo {
            width: ${logoSize}px;
            height: ${logoSize}px;
            object-fit: contain;
            margin-bottom: 10px;
            filter: drop-shadow(0 8px 20px rgba(92, 184, 209, 0.3));
        }
        
        h1 {
            color: #5cb8d1;
            font-size: 32px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 20px rgba(92, 184, 209, 0.5);
            margin-bottom: 5px;
            line-height: 1.2;
        }
        
        .subtitle {
            color: #8ec9dc;
            font-size: 14px;
            font-weight: 400;
        }
        
        .finals-round {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .round {
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .round-title {
            color: #5cb8d1;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            white-space: nowrap;
        }
        
        .matches-column {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            flex: 1;
        }
        
        .match {
            background: rgba(26, 41, 66, ${matchOpacity});
            border: 1px solid rgba(92, 184, 209, ${borderOpacity});
            border-radius: ${cornerRadius}px;
            padding: 6px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            transition: all 0.3s;
            width: ${Math.max(200, matchWidth - 40)}px;
            position: relative;
        }
        
        .match:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(92, 184, 209, 0.3);
            border-color: rgba(92, 184, 209, 0.8);
        }
        
        .match-teams {
            display: flex;
            gap: 6px;
            align-items: stretch;
        }
        
        .team {
            padding: 6px;
            background: rgba(45, 74, 110, 0.3);
            border-radius: ${Math.max(0, cornerRadius - 4)}px;
            transition: all 0.3s;
            flex: 1;
        }
        
        .team.winner {
            background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2));
            border: 2px solid rgba(46, 204, 113, 0.6);
            box-shadow: 0 0 15px rgba(46, 204, 113, 0.2);
        }
        
        .team-name {
            color: #5cb8d1;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 3px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            line-height: 1.2;
        }
        
        .team.winner .team-name {
            color: #2ecc71;
            text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }
        
        .player {
            background: rgba(26, 41, 66, 0.6);
            border: 1px solid rgba(92, 184, 209, 0.15);
            border-radius: ${Math.max(0, cornerRadius - 6)}px;
            padding: 4px 6px;
            margin-bottom: 2px;
            transition: all 0.2s;
        }
        
        .player:last-child {
            margin-bottom: 0;
        }
        
        .player.has-decklist {
            cursor: pointer;
            border-color: rgba(92, 184, 209, 0.3);
        }
        
        .player.has-decklist:hover {
            background: rgba(92, 184, 209, 0.25);
            border-color: rgba(92, 184, 209, 0.5);
            transform: translateX(2px);
        }
        
        .player-compact {
            color: #e8f4f8;
            font-size: 9px;
            font-weight: 500;
            line-height: 1.4;
            display: block;
        }
        
        .vs {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5cb8d1;
            font-size: 10px;
            font-weight: 700;
            opacity: 0.6;
            letter-spacing: 1px;
            min-width: 30px;
        }
        
        .finals-round .match {
            border: 3px solid rgba(255, 215, 0, 0.6);
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.3), 0 6px 24px rgba(0, 0, 0, 0.4);
        }
        
        .finals-round .round-title {
            color: #ffd700;
            font-size: 20px;
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }
        
        /* Decklist Modal */
        .decklist-modal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            justify-content: center;
            align-items: center;
        }
        
        .decklist-modal.active {
            display: flex;
        }
        
        .decklist-content {
            max-width: 90%;
            max-height: 90%;
            position: relative;
        }
        
        .decklist-content img {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 0 50px rgba(92, 184, 209, 0.5);
        }
        
        .modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            color: #fff;
            font-size: 32px;
            font-weight: bold;
            cursor: pointer;
            background: rgba(231, 76, 60, 0.8);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        
        .modal-close:hover {
            background: rgba(231, 76, 60, 1);
            transform: scale(1.1);
        }
        
        @media print {
            body { background: white; color: black; }
            .match { border-color: #333; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="bracket-wrapper">
        <div class="left-wing">
            ${leftWingHTML}
        </div>
        ${centerHTML}
        <div class="right-wing">
            ${rightWingHTML}
        </div>
    </div>
    
    <!-- Decklist Modal -->
    <div class="decklist-modal" id="decklistModal" onclick="closeDecklist(event)">
        <div class="decklist-content" onclick="event.stopPropagation()">
            <span class="modal-close" onclick="closeDecklist()">&times;</span>
            <img id="decklistImage" src="" alt="Decklist">
        </div>
    </div>
    
    <script>
        function openDecklist(path) {
            const modal = document.getElementById('decklistModal');
            const img = document.getElementById('decklistImage');
            img.src = path;
            modal.classList.add('active');
        }
        
        function closeDecklist(event) {
            if (!event || event.target.id === 'decklistModal' || event.target.className.includes('modal-close')) {
                const modal = document.getElementById('decklistModal');
                modal.classList.remove('active');
            }
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDecklist();
            }
        });
    </script>
</body>
</html>`;
            }
        }
        function generatePresentationMatch(round, matchNum) {
            const { type, playersPerTeam } = bracketConfig;
            const matchId = `r${round}m${matchNum}`;
            const winnerTeam = winners[matchId];
            
            let html = '<div class="match"><div class="match-teams">';
            
            for (let team = 0; team < 2; team++) {
                const teamId = `${matchId}t${team}`;
                const isWinner = winnerTeam === team;
                
                html += `<div class="team${isWinner ? ' winner' : ''}">`;
                
                if (type === 'teams') {
                    const teamName = document.getElementById(`${teamId}-name`)?.value || `Team ${team + 1}`;
                    html += `<div class="team-name">${teamName}</div>`;
                    
                    for (let p = 0; p < playersPerTeam; p++) {
                        const playerId = `${teamId}p${p}`;
                        const playerName = document.getElementById(`${playerId}-name`)?.value || '';
                        const leader = document.getElementById(`${playerId}-leader`)?.value || '';
                        const base = document.getElementById(`${playerId}-base`)?.value || '';
                        const decklistFile = decklists[playerId];
                        
                        if (playerName || leader || base) {
                            const deckInfo = (leader && base) ? `${leader} / ${base}` : (leader || base);
                            
                            html += `<div class="player${decklistFile ? ' has-decklist' : ''}" ${decklistFile ? `onclick="openDecklist('./decklists/${decklistFile}')"` : ''}>`;
                            html += `<span class="player-compact">${playerName}${deckInfo ? ' • ' + deckInfo : ''}</span>`;
                            html += '</div>';
                        }
                    }
                } else {
                    // Singles mode
                    const playerName = document.getElementById(`${teamId}-name`)?.value || `Player ${team + 1}`;
                    const leader = document.getElementById(`${teamId}-leader`)?.value || '';
                    const base = document.getElementById(`${teamId}-base`)?.value || '';
                    const decklistFile = decklists[teamId];
                    
                    html += `<div class="team-name">${playerName}</div>`;
                    const deckInfo = (leader && base) ? `${leader} / ${base}` : (leader || base);
                    
                    if (deckInfo || decklistFile) {
                        html += `<div class="player${decklistFile ? ' has-decklist' : ''}" ${decklistFile ? `onclick="openDecklist('./decklists/${decklistFile}')"` : ''}>`;
                        html += `<span class="player-compact">${deckInfo}</span>`;
                        html += '</div>';
                    }
                }
                
                html += '</div>';
                
                if (team === 0) {
                    html += '<div class="vs">VS</div>';
                }
            }
            
            html += '</div></div>'; // Close match-teams and match
            return html;
        }