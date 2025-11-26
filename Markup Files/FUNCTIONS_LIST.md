# Complete storage.js Function List

## ✅ All Functions Now Included

### Data Storage Functions
- `saveToLocalStorage()` - Saves bracket data to browser localStorage
- `loadFromLocalStorage()` - Loads bracket data from localStorage on page load
- `exportBracketData()` - Exports bracket data to JSON file
- `importBracketData(event)` - Imports bracket data from JSON file

### Helper Functions
- `updateWinnerButtons()` - Updates winner button visual states after loading
- `updateUploadButtons()` - Updates decklist upload button states after loading

### Data Management Functions
- `clearAllData()` - Clears all bracket data (teams, players, winners, decklists, logo)
- `clearResults()` - Clears only winner selections, keeps team/player data

### Presentation Settings Functions
- `toggleSettings()` - Shows/hides presentation settings panel
- `updateSettingValue(id, value)` - Updates displayed setting value in UI
- `saveSettings()` - Saves presentation settings to localStorage
- `loadSettings()` - Loads presentation settings from localStorage
- `resetSettings()` - Resets presentation settings to defaults

## Variables (Declared in config.js)
- `bracketConfig` - Current bracket configuration
- `winners` - Match winner selections
- `decklists` - Decklist file references
- `logoData` - Logo path

## Constants (From config.js)
- `STORAGE_KEY` - Key for bracket data in localStorage
- `SETTINGS_KEY` - Key for presentation settings in localStorage

## File Size
- **384 lines** (clean, well-organized code)
- **No duplicate declarations**
- **All necessary functions included**

## Load Order Dependencies
storage.js depends on:
1. **config.js** (must load first) - declares global variables
2. **bracket-generator.js** - provides `generateBracket()`, `markWinner()`
3. **main.js** - calls these functions on page load

## Functions Called By HTML
The following functions are directly called from index.html:
- `exportBracketData()` - "Export Data" button
- `importBracketData(event)` - "Import Data" file input
- `clearAllData()` - "Clear All" button
- `clearResults()` - "Clear Results" button
- `toggleSettings()` - "Presentation Settings" button
- `saveSettings()` - Settings panel "Save" button
- `resetSettings()` - Settings panel "Reset" button

All of these are now properly defined! ✅
