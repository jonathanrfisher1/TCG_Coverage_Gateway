# Azure Bracket Manager - Quick Reference Card

## 🚀 Setup Commands (Copy-Paste Ready)

### Initial Setup
```bash
# Make setup script executable
chmod +x azure-setup.sh

# Run setup (creates all Azure resources)
./azure-setup.sh

# Output: azure-config.txt
```

### Deploy Functions
```bash
cd functions
npm install
func azure functionapp publish YOUR_FUNCTION_APP_NAME
```

### Common Azure CLI Commands
```bash
# Login
az login

# List resources
az resource list --resource-group bracket-manager-rg --output table

# View costs
az consumption usage list --start-date 2024-12-01

# Check Cosmos DB throughput
az cosmosdb sql container throughput show \
  --account-name YOUR_COSMOS \
  --database-name BracketManager \
  --resource-group bracket-manager-rg \
  --name Brackets

# Stop Function App (emergency)
az functionapp stop --name YOUR_FUNC_APP --resource-group bracket-manager-rg

# Start Function App
az functionapp start --name YOUR_FUNC_APP --resource-group bracket-manager-rg
```

---

## 📊 Cost Monitoring

### Weekly Check
1. Portal → Cost Management → Cost Analysis
2. Filter: Resource group = `bracket-manager-rg`
3. Time: Last 7 days

### Expected Costs
- Functions: $0 (under 1M)
- Cosmos DB: $0 (free tier)
- Blob Storage: $0.10-2.00
- **Total: $0.10-2.00/month**

---

## 🔗 Important Links

### Azure Portal Quick Links
- [Cost Analysis](https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/overview)
- [Budgets](https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/budgets)
- [All Resources](https://portal.azure.com/#blade/HubsExtension/BrowseAll)

### Your Resources (after setup)
- Resource Group: `bracket-manager-rg`
- Storage: `bracketstorage######`
- Functions: `bracket-api-func-######`
- Cosmos DB: `bracket-cosmos-######`

*Replace ###### with your unique numbers from azure-config.txt*

---

## 🛡️ Cost Protection Settings

### Budget Alerts
- 50% ($2.50) → Email
- 80% ($4.00) → Email
- 90% ($4.50) → Email + Action Group
- 100% ($5.00) → Email + Action Group

### Rate Limits (in code)
- Uploads: 1000/month
- Saves: 500/month
- File size: 10MB max

### Hard Limits
- Cosmos DB: 400 RU/s (cannot exceed)
- Functions: 3 instances max
- Timeout: 5 minutes

---

## 🧪 Test Commands

### Test Upload
```bash
curl -X POST https://YOUR_FUNC_APP.azurewebsites.net/api/upload \
  -F "file=@test.jpg"
```

### Test Save Bracket
```bash
curl -X POST https://YOUR_FUNC_APP.azurewebsites.net/api/saveBracket \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","config":{},"teams":[],"winners":{}}'
```

### Test Get Bracket
```bash
curl https://YOUR_FUNC_APP.azurewebsites.net/api/getBracket?id=BRACKET_ID
```

---

## 🐛 Troubleshooting Checklist

### Upload Fails (403 Error)
- [ ] Check Managed Identity enabled
- [ ] Verify Storage permissions
- [ ] Check Function App logs

### High Costs Alert
- [ ] Check Cosmos DB is at 400 RU/s
- [ ] Check Function execution count
- [ ] Review Cost Analysis
- [ ] Stop Function App if needed

### Function Not Working
- [ ] Wait 2-3 minutes after deploy
- [ ] Check Function App logs
- [ ] Verify environment variables set
- [ ] Test locally with `func start`

---

## 📱 Mobile Quick Access

**Save these bookmarks:**
1. Azure Portal (mobile app available)
2. Cost Management dashboard
3. Your Function App logs
4. This GitHub repo

---

## 🎓 Certification Topics Covered

✅ **AZ-900**
- Cloud concepts
- Azure services
- Cost management

✅ **AZ-204**
- Azure Functions
- Blob Storage
- Cosmos DB
- Managed Identity

✅ **AZ-104**
- Resource management
- Identity management
- Cost governance
- Monitoring

---

## 📞 Emergency Contacts

**If costs spike unexpectedly:**

1. **Immediate:** Stop Function App
```bash
az functionapp stop --name YOUR_FUNC --resource-group bracket-manager-rg
```

2. **Check:** Cost Analysis for culprit

3. **Verify:** Cosmos DB at 400 RU/s

4. **Document:** What happened (for learning)

---

## 💾 Backup Configuration

After setup completes, save securely:
- [ ] azure-config.txt
- [ ] Resource names
- [ ] Function App URL
- [ ] Budget alert emails

---

## ⏱️ Regular Maintenance

### Weekly (5 minutes)
- Check Cost Analysis
- Review Function execution count
- Check for email alerts

### Monthly (15 minutes)
- Review budget status
- Check Cosmos DB usage
- Review Function App logs
- Update functions if needed

---

## 🎯 Success Indicators

You're successful when:
- ✅ All functions return 200 status
- ✅ Uploads work from frontend
- ✅ Brackets can be shared via URL
- ✅ Cost under $2/month
- ✅ Budget alerts configured
- ✅ No 403/500 errors

---

## 📚 Files Reference

- `AZURE_SETUP_README.md` - Full overview
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `BUDGET_SETUP.md` - Budget configuration
- `azure-config.txt` - Your resource names (created by script)
- `azure-setup.sh` - Automated setup script

---

**Print this page and keep it handy!** 📄

Last updated: 2024-12-26
