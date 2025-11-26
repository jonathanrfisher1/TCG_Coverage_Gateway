# Tournament Bracket Manager

A modular tournament bracket management system for creating and displaying tournament brackets.

## Files Structure

- **index.html** - Main HTML page
- **styles.css** - All CSS styling
- **config.js** - Bracket configuration and settings
- **storage.js** - LocalStorage management
- **bracket-generator.js** - Editor bracket generation  
- **presentation.js** - Presentation mode HTML generation
- **main.js** - Event handlers and initialization

## How to Use

1. Open `index.html` in a browser
2. Configure your bracket settings
3. Enter team/player information
4. Use "Download Presentation" to export a standalone HTML file for your website

## Website Upload Instructions

When you export the presentation HTML:

1. Upload the HTML file to your website
2. Create a `decklists/` folder in the same directory
3. Upload your decklist images to the `decklists/` folder with the exact filenames you assigned in the manager

Example structure on your website:
```
/tournament/
  ├── bracket.html
  └── decklists/
      ├── player1_deck.png
      ├── player2_deck.png
      └── ...
```

The decklist links will work automatically using relative paths.
