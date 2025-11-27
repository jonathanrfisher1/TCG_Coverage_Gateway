# Tournament Manager File Structure

## Overview
The tournament manager now uses **relative paths** for decklists and logos instead of embedding data in JSON files. This makes files smaller, easier to manage, and better for version control.

## Directory Structure

```
tournament-manager/
├── index.html
├── styles.css
├── config.js
├── storage.js          ← Updated
├── bracket-generator.js ← Updated
├── presentation.js
├── main.js
├── README.md
├── logo.png            ← Place your logo here
└── decklists/          ← Place all decklist files here
    ├── player1-deck.pdf
    ├── player2-deck.jpg
    └── ...
```

## How It Works

### Logo
- **Upload**: When you upload a logo via "Select Logo", it records the path as `./logo.png` (or .jpg, etc.)
- **Storage**: JSON only stores the path: `"logoData": "./logo.png"`
- **Deployment**: Place your actual logo file as `logo.png` in the same folder as `index.html`

### Decklists
- **Upload**: When you upload a decklist, it records just the filename
- **Storage**: JSON stores: `"decklists": { "r0m0t0p0": "player-deck.pdf" }`
- **Deployment**: Place all PDF/image files in a `decklists/` subfolder
- **Presentation**: Links will be `./decklists/player-deck.pdf`

## JSON File Format

### Example Export
```json
{
  "config": {
    "type": "teams",
    "playersPerTeam": 3,
    "bracketSize": 8
  },
  "inputs": {
    "r0m0t0-name": "Team Name",
    "r0m0t0p0-name": "Player 1",
    "r0m0t0p0-leader": "Anakin",
    "r0m0t0p0-base": "Data Vault"
  },
  "winners": {
    "r0m0": 0,
    "r1m0": 1
  },
  "decklists": {
    "r0m0t0p0": "player1-deck.pdf",
    "r0m0t0p1": "player2-deck.jpg"
  },
  "logoData": "./logo.png"
}
```

## Key Changes from Previous Version

### ✅ What Changed
1. **Logo**: Now stores `"./logo.png"` instead of base64 data
2. **Decklists**: Already used paths (no change needed)
3. **Export**: Only saves initial bracket (Round 0) + winners
4. **Import**: Reconstructs advanced rounds from winners

### 📦 File Sizes
- **Old approach**: 100KB+ JSON files (base64 logo data)
- **New approach**: 5-10KB JSON files (just paths)

## Workflow

### Creating a Bracket
1. Open `index.html` in browser
2. Configure bracket (teams/players, bracket size)
3. Fill in team/player info
4. Upload logo (stores as `./logo.png`)
5. Upload decklists (stores filenames)
6. Mark winners as matches progress

### Exporting
1. Click "Export Data"
2. Saves JSON with:
   - Initial bracket data (Round 0 only)
   - Winner selections
   - Paths to logo and decklists

### Deploying
1. Create folder for deployment
2. Place `index.html` and all JS/CSS files
3. Place `logo.png` in root folder
4. Create `decklists/` folder
5. Place all decklist PDFs/images in `decklists/`
6. Import your JSON file
7. Generate presentation HTML

### Presentation HTML
- Click "Export Bracket HTML"
- Move presentation HTML to deployment folder
- All paths will work relative to that folder

## Benefits

✨ **Smaller files**: JSON is 97%+ smaller  
🎯 **Single source of truth**: Logo/decklists stored once  
📁 **Easy management**: Can swap logo/decklists without re-exporting  
🔄 **Version control friendly**: Binary data not in JSON  
🌐 **Web deployment**: Standard file structure for hosting
