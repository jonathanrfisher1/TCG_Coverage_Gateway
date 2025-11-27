# Azure Bracket Manager - Deployment Guide

## 📋 Step-by-Step Deployment

### Step 1: Run Azure Setup Script

```bash
# Make script executable
chmod +x azure-setup.sh

# Run setup (this takes ~10 minutes)
./azure-setup.sh
```

This script will:
- ✅ Create all Azure resources
- ✅ Configure Managed Identity
- ✅ Set up permissions
- ✅ Create alerts
- ✅ Save configuration

**Output:** `azure-config.txt` with all your resource names

---

### Step 2: Deploy Functions Code

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Test functions locally (optional)
func start

# Login to Azure (if not already)
az login

# Get Function App name from azure-config.txt
FUNCTION_APP_NAME="your-function-app-name-here"

# Deploy to Azure
func azure functionapp publish $FUNCTION_APP_NAME

# Alternative: Deploy using Azure CLI
cd ..
zip -r functions.zip functions/
az functionapp deployment source config-zip \
  --resource-group bracket-manager-rg \
  --name $FUNCTION_APP_NAME \
  --src functions.zip
```

**Expected output:**
```
Deployment successful.
Functions:
  upload - [POST] https://your-func-app.azurewebsites.net/api/upload
  saveBracket - [POST] https://your-func-app.azurewebsites.net/api/saveBracket
  getBracket - [GET] https://your-func-app.azurewebsites.net/api/getBracket
```

---

### Step 3: Test Functions

Test upload:
```bash
# Test upload function
curl -X POST https://your-func-app.azurewebsites.net/api/upload \
  -F "file=@test-image.jpg" \
  -H "Content-Type: multipart/form-data"

# Expected response:
# {
#   "success": true,
#   "url": "https://bracketstorage.blob.core.windows.net/decklists/123456_abc.jpg",
#   "fileName": "123456_abc.jpg"
# }
```

Test save bracket:
```bash
# Test saveBracket function
curl -X POST https://your-func-app.azurewebsites.net/api/saveBracket \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bracket",
    "config": {"type": "teams"},
    "teams": [],
    "winners": {}
  }'

# Expected response:
# {
#   "success": true,
#   "id": "bracket_123456_abc",
#   "url": "https://yoursite.com/bracket-manager?id=bracket_123456_abc"
# }
```

Test get bracket:
```bash
# Test getBracket function
curl https://your-func-app.azurewebsites.net/api/getBracket?id=bracket_123456_abc

# Expected response:
# {
#   "success": true,
#   "bracket": { ... }
# }
```

---

### Step 4: Update Bracket Manager Frontend

Update `bracket-generator.js` with your Function App URL:

```javascript
// At the top of the file, add:
const API_BASE_URL = 'https://your-func-app.azurewebsites.net/api';

// Update handleDecklistUpload function:
async function handleDecklistUpload(event, playerId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const btn = document.getElementById(playerId + '-btn');
    btn.textContent = '⏳ Uploading...';
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        // Store Blob URL
        decklists[playerId] = data.url;
        
        btn.classList.add('has-file');
        btn.textContent = '✓ ' + file.name;
        btn.disabled = false;
        
        saveToLocalStorage();
        
    } catch (error) {
        console.error('Upload failed:', error);
        btn.textContent = '❌ Failed';
        btn.disabled = false;
        alert('Upload failed. Please try again.');
    }
}

// Same for handleLogoUpload...
```

---

### Step 5: Add Share Bracket Feature

Add to your HTML (in controls section):

```html
<button class="control-btn" onclick="shareBracket()">
    🔗 Share Bracket Online
</button>
```

Add to JavaScript:

```javascript
async function shareBracket() {
    if (!confirm('Save and share this bracket online?')) {
        return;
    }
    
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const bracketData = {
        title: settings.tournamentTitle || 'Tournament Bracket',
        config: bracketConfig,
        teams: gatherAllTeamData(), // You'll need to implement this
        winners: winners,
        decklists: decklists,
        logoData: logoData
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/saveBracket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bracketData)
        });
        
        if (!response.ok) {
            throw new Error('Save failed');
        }
        
        const data = await response.json();
        
        // Show shareable URL
        const url = data.url;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(url);
        
        alert(`✓ Bracket saved!\n\nShareable URL copied to clipboard:\n${url}`);
        
    } catch (error) {
        console.error('Share failed:', error);
        alert('Failed to share bracket. Please try again.');
    }
}
```

---

### Step 6: Add Load Shared Bracket Feature

Add to `main.js` (on page load):

```javascript
// Check for shared bracket on page load
window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get('id');
    
    if (bracketId) {
        await loadSharedBracket(bracketId);
    } else {
        loadFromLocalStorage();
    }
    
    loadSettings();
});

async function loadSharedBracket(bracketId) {
    try {
        const response = await fetch(`${API_BASE_URL}/getBracket?id=${bracketId}`);
        
        if (!response.ok) {
            throw new Error('Bracket not found');
        }
        
        const data = await response.json();
        const bracket = data.bracket;
        
        // Apply bracket configuration
        bracketConfig = bracket.config;
        winners = bracket.winners || {};
        decklists = bracket.decklists || {};
        logoData = bracket.logoData || null;
        
        // Update settings if present
        if (bracket.title) {
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
            settings.tournamentTitle = bracket.title;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
        
        // Generate and populate bracket
        generateBracket();
        populateSharedBracket(bracket.teams);
        
        // Update page title
        document.title = `${bracket.title} - Bracket Manager`;
        
        alert(`✓ Loaded shared bracket: ${bracket.title}`);
        
    } catch (error) {
        console.error('Failed to load shared bracket:', error);
        alert('Failed to load shared bracket. Please check the URL.');
    }
}

function populateSharedBracket(teams) {
    // Populate all team/player inputs from shared data
    // You'll need to implement this based on your data structure
    teams.forEach(team => {
        // Set input values...
    });
}
```

---

### Step 7: Push to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Add Azure Functions integration"

# Push to master
git push origin master
```

Your Static Web App will automatically deploy!

---

### Step 8: Update Static Web App Settings

In Azure Portal:

1. Go to your Static Web App
2. Settings → Configuration
3. Add Application Settings:
   - `API_BASE_URL` = Your Function App URL

Or use CLI:
```bash
az staticwebapp appsettings set \
  --name bracket-static-web \
  --setting-names API_BASE_URL="https://your-func-app.azurewebsites.net/api"
```

---

## 🎉 Deployment Complete!

Your bracket manager now has:
- ✅ File uploads (decklists, logos)
- ✅ Shareable brackets
- ✅ Persistent storage
- ✅ Cost protections
- ✅ Free tier usage

---

## 🔍 Verification Checklist

- [ ] Functions deployed successfully
- [ ] Test upload works
- [ ] Test save bracket works
- [ ] Test load bracket works
- [ ] Budget alerts configured
- [ ] Monitoring dashboard set up
- [ ] Frontend updated with API calls
- [ ] Shared bracket loading works

---

## 🐛 Troubleshooting

**"Upload fails with 403 error"**
- Check Managed Identity permissions
- Verify storage account has correct role assignments
- Run: `az role assignment list --assignee <PRINCIPAL_ID>`

**"Cosmos DB errors"**
- Verify free tier is enabled
- Check throughput is set to 400 RU/s
- Verify Managed Identity has Cosmos DB permissions

**"Functions don't appear after deploy"**
- Wait 2-3 minutes for deployment
- Check Function App logs in Portal
- Verify host.json and function.json are correct

**"High costs appearing"**
- Check Cosmos DB throughput (should be 400)
- Check Function App is on Consumption plan
- Review Cost Analysis in Portal

---

## 📊 Monitoring

**View logs:**
```bash
az functionapp logs tail \
  --name your-func-app \
  --resource-group bracket-manager-rg
```

**View metrics:**
- Azure Portal → Function App → Monitor
- Check execution count, duration, errors

**Check costs:**
- Azure Portal → Cost Management → Cost Analysis
- Filter by resource group: bracket-manager-rg

---

## Need Help?

Refer to:
- `azure-config.txt` - All your resource names
- `BUDGET_SETUP.md` - Budget configuration
- Azure Portal logs for detailed errors
