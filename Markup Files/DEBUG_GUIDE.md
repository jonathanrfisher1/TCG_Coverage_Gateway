# Import Debugging Guide

## How to Debug Import Issues

### 1. Open Browser Console
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- Click on the **Console** tab

### 2. Try Importing
1. Click "Import Data" button
2. Select your JSON file
3. Watch the console output

### 3. What to Look For

#### ✅ Successful Import Should Show:
```
=== IMPORT STARTED ===
File selected: bothan_bracket_2025-11-16_simplified__2_.json
File read successfully, parsing JSON...
Parsed data: {config: {...}, inputs: {...}, ...}
Applying config: {type: "teams", playersPerTeam: 3, bracketSize: 8}
Generating bracket...
Bracket generated
Loaded decklists: {r0m0t0p0: "SOP Talzin Yel.pdf"}
=== POPULATING BRACKET (after 100ms delay) ===
Populating inputs, count: 80
Populated 80 inputs, 0 missing
Applying winners: {r0m0: null, r0m1: null, ...}
Applied 0 winners
Updating button states...
=== IMPORT COMPLETE ===
Logo loaded: ./logo.png
```

#### ❌ Common Issues to Watch For:

**Missing Inputs:**
```
Input not found: r0m0t0-name
Input not found: r0m0t0p0-name
```
→ **Problem**: Bracket wasn't generated before trying to populate
→ **Check**: Did you see "Bracket generated" message?

**Function Not Found:**
```
Uncaught ReferenceError: markWinner is not defined
```
→ **Problem**: bracket-generator.js not loaded
→ **Check**: Are all JS files included in index.html?

**Parse Error:**
```
Unexpected token in JSON at position X
```
→ **Problem**: JSON file is malformed
→ **Check**: Validate JSON at jsonlint.com

**UpdatePlayerPerTeamVisibility Error:**
```
Cannot read property 'style' of null
```
→ **Problem**: DOM elements not ready
→ **Check**: Is the page fully loaded?

### 4. Quick Test

Try this in the console after import:
```javascript
// Check if config was set
console.log('Config:', bracketConfig);

// Check if first team name was populated
console.log('First team:', document.getElementById('r0m0t0-name')?.value);

// Check winners
console.log('Winners:', winners);

// Check decklists
console.log('Decklists:', decklists);
```

### 5. Report Back

If import fails, copy the **entire console output** and share it so we can see exactly what's happening!
