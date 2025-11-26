# Clip Icon Removal + Logo Fix

## ✅ 1. Removed Clip Icons

All 📎 icons have been removed from player displays. The clickable functionality remains - players with decklists are still clickable and have hover effects (subtle border highlight), but no visual icon is shown.

**Changed in 4 locations:**
- `generateMatchContent()` - Teams mode
- `generateMatchContent()` - Singles mode  
- `generatePresentationMatch()` - Teams mode
- `generatePresentationMatch()` - Singles mode

## ✅ 2. Logo Fixed

### The Problem:
The code was storing logo as `./logo.png` (generic name), but your actual file is `BN-Logo_1.png`. The presentation couldn't find the file because the names didn't match.

### The Fix:
Logo now stores the **actual filename** instead of a generic name.

**Before:**
```javascript
logoData = `./logo.${file.name.split('.').pop()}`;
// Stored as: ./logo.png
```

**After:**
```javascript
logoData = `./${file.name}`;
// Stored as: ./BN-Logo_1.png
```

### ⚠️ Important: You Need to Re-Upload Your Logo

Because of the path change, you need to:

1. **Replace the updated files:**
   - `presentation.js`
   - `bracket-generator.js`

2. **In Bracket Manager:**
   - Click the logo upload button again
   - Select your `BN-Logo_1.png` file
   - It will now store the correct path

3. **File Structure:**
   Your folder should look like:
   ```
   tournament-manager/
   ├── index.html
   ├── BN-Logo_1.png          ← Logo file (your actual filename)
   ├── presentation.js
   ├── bracket-generator.js
   └── decklists/
       └── *.pdf, *.jpg
   ```

### Why This Works Better:
- You can use any filename for your logo
- No need to rename files to "logo.png"
- Consistent with how decklists work (actual filenames)
- Logo path is stored: `./BN-Logo_1.png`

## 📦 Files Updated:

- **[presentation.js](computer:///mnt/user-data/outputs/presentation.js)** - Removed clip icons
- **[bracket-generator.js](computer:///mnt/user-data/outputs/bracket-generator.js)** - Fixed logo path storage

## 🎯 Next Steps:

1. Replace both files
2. Refresh the page
3. Re-upload your logo using the logo button
4. Launch presentation mode - logo should appear!

The logo upload will now save the actual filename, so `BN-Logo_1.png` will work perfectly.
