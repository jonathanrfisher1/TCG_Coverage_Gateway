# Bracket Manager - Decklist URL Update

## Summary of Changes

Your bracket manager has been updated to use decklist URLs (like your Azure blob storage URLs) instead of local file uploads.

## What Changed

### 1. **bracket-generator.js** - Updated
- Removed file upload button for decklists
- Added text input field for decklist URLs
- Each player now has a "🔗 Decklist URL (optional)" field
- URLs are validated and highlighted in green when entered
- Auto-advance now copies decklist URLs when winners progress

### 2. **presentation.js** - Updated
- Changed from relative file paths (`./decklists/filename.png`) to full URLs
- Updated `openDecklist()` function to accept player name for better downloads
- Added download button to the decklist modal
- Download button creates filename from player name (e.g., "andrew_han_decklist.png")
- Removed alert message about local decklist folder

### 3. **storage.js** - Updated
- Added `updateDecklistInputs()` function to properly load saved URLs
- URLs are now stored as strings in the decklists object
- Import/export handles decklist URLs correctly
- Legacy format translation updated to handle URL strings

### 4. **CSS** - New Styles Added
- Decklist URL input fields have custom styling
- Green highlight when URL is entered
- Download button styling in modal (green button next to close button)

## How to Install

1. **Replace these 3 files** in your bracket manager folder:
   - `bracket-generator.js`
   - `presentation.js`
   - `storage.js`

2. **Add the CSS** from `decklist-url-styles.css` to your `styles.css` file
   - Copy the entire contents and paste at the end of styles.css

## How to Use

### Adding Decklist URLs

1. Open your bracket manager
2. For each player, you'll see a new field: "🔗 Decklist URL (optional)"
3. Paste the full Azure blob URL, for example:
   ```
   https://tcgcoveragegatewaystore.blob.core.windows.net/decklists/BIATL 2 3v3 Teams/BN Blue/Andrew Han 2 Blue.png
   ```
4. The field will turn green when a URL is entered
5. Data auto-saves as you type

### Presentation Mode

1. Click "🎬 Launch Presentation Mode"
2. Players with decklists will have clickable areas
3. Click on a player to open their decklist in a modal
4. In the modal:
   - Click the **⬇️ Download** button to download the image
   - Download filename will be based on player name
   - Click **×** or press Escape to close

### Export Bracket HTML

1. Click "💾 Export Bracket HTML"
2. This creates a standalone HTML file with all data embedded
3. Upload this file to Azure blob storage
4. Link to it from WordPress

## Example Workflow

```
1. Enter team name: "BN Blue"
2. Enter player name: "Andrew Han"
3. Enter leader: "Boba Fett"
4. Enter base: "Fang Fighter"
5. Paste decklist URL: https://tcgcoveragegatewaystore.blob.core.windows.net/decklists/...
6. Field turns green ✓
7. Export presentation HTML
8. Upload to Azure
9. Link from WordPress
```

## Technical Notes

- URLs are stored directly in the `decklists` object
- No file uploads needed - everything works with URLs
- Download button uses the URL directly
- CORS may prevent direct downloads in some browsers, but will open in new tab as fallback
- Player names are sanitized for filenames (special characters become underscores)

## Future Enhancements (Your Upload System)

When you build the full upload system:
1. User uploads PNG to your Azure backend
2. Backend returns Azure blob URL
3. Auto-populate the decklist URL field with the returned URL
4. Everything else works the same way

The current system is ready for that - just paste in the URLs!
