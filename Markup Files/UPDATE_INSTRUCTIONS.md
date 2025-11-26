# 🔧 CRITICAL UPDATE INSTRUCTIONS

## The Errors You're Seeing

1. **"Identifier 'winners' has already been declared"** 
   - Caused by: Old storage.js declaring variables that config.js already declares
   
2. **"loadFromLocalStorage is not defined"**
   - Caused by: Old/broken storage.js file

## 📋 How to Fix

### Step 1: Replace Files
Download and replace these files in your tournament-manager folder:

1. **storage.js** ← CRITICAL - This fixes both errors
2. **bracket-generator.js** ← For logo path support

### Step 2: Clear Browser Cache
After replacing files:
1. Open your tournament manager in the browser
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh
3. OR: Press `Ctrl+F5` (Windows) or `Cmd+Option+R` (Mac)

This ensures the browser loads the NEW files, not cached old versions.

### Step 3: Clear Local Storage (Optional but Recommended)
1. Press `F12` to open browser console
2. Type: `localStorage.clear(); location.reload();`
3. Press Enter

This clears any old saved data that might conflict.

### Step 4: Test
1. Page should load without errors
2. Try importing your JSON file
3. Check console (F12) for detailed logging

## 🔍 Verify Script Order in index.html

Your index.html should have scripts in this EXACT order:
```html
<script src="config.js"></script>
<script src="storage.js"></script>
<script src="bracket-generator.js"></script>
<script src="presentation.js"></script>
<script src="main.js"></script>
```

## ✅ What Changed in storage.js

### Fixed:
- ❌ Removed duplicate variable declarations (winners, decklists, logoData, bracketConfig)
- ✅ All variables now only declared in config.js
- ✅ Added clearResults() function that was missing
- ✅ Added comprehensive debugging logs
- ✅ Simplified import/export logic

### Functions Now Available:
- `saveToLocalStorage()`
- `loadFromLocalStorage()`
- `exportBracketData()`
- `importBracketData(event)`
- `clearAllData()`
- `clearResults()`
- `updateWinnerButtons()`
- `updateUploadButtons()`

## 🚨 Common Mistakes to Avoid

1. **Not doing a hard refresh** - Browser might use cached old files
2. **Replacing only one file** - Both storage.js AND bracket-generator.js need updating
3. **Wrong file names** - Make sure you're replacing the RIGHT storage.js (not storage_clean.js)

## 📊 After Update, You Should See in Console:

When importing:
```
=== IMPORT STARTED ===
File selected: your-file.json
File read successfully, parsing JSON...
Parsed data: {...}
Applying config: {type: "teams", playersPerTeam: 3, bracketSize: 8}
Generating bracket...
Bracket generated
=== POPULATING BRACKET (after 100ms delay) ===
Populated 80 inputs, 0 missing
=== IMPORT COMPLETE ===
```

When page loads:
```
=== LOADING FROM LOCALSTORAGE ===
No saved data found
```
(Or if there's saved data, it will show what's being loaded)

## 🆘 Still Having Issues?

Open console (F12) and run:
```javascript
// Check if functions exist
console.log('loadFromLocalStorage:', typeof loadFromLocalStorage);
console.log('saveToLocalStorage:', typeof saveToLocalStorage);
console.log('importBracketData:', typeof importBracketData);
console.log('clearResults:', typeof clearResults);

// Check if variables exist
console.log('winners:', typeof winners);
console.log('bracketConfig:', typeof bracketConfig);
```

All should show "function" or "object", not "undefined".

If any show "undefined", the files aren't loading properly. Double-check:
1. File names are exact (case-sensitive!)
2. Files are in the right folder
3. You did a hard refresh
4. index.html has correct script tags
