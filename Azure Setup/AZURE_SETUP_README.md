# Azure Bracket Manager - Complete Setup Package

## 🎯 What You're Building

A fully-featured tournament bracket manager with:
- ✅ File uploads (decklists, logos) stored in Azure Blob
- ✅ Shareable bracket URLs
- ✅ Persistent cloud storage
- ✅ **Free tier Azure infrastructure**
- ✅ **Cost protections** (budget alerts, rate limiting)
- ✅ Production-ready with Managed Identity security

**Cost:** $0-$2/month (mostly free tier)

---

## 📦 What's Included

### Setup Scripts
- `azure-setup.sh` - Automated Azure resource creation
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `BUDGET_SETUP.md` - Manual budget configuration

### Functions Code
```
functions/
├── upload/
│   ├── index.js         (File upload with rate limiting)
│   └── function.json
├── saveBracket/
│   ├── index.js         (Save bracket to Cosmos DB)
│   └── function.json
├── getBracket/
│   ├── index.js         (Load shared bracket)
│   └── function.json
├── host.json            (Cost protections configured)
└── package.json         (Dependencies)
```

### Documentation
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `BUDGET_SETUP.md` - Budget alerts setup
- This README

---

## 🚀 Quick Start (3 Steps)

### Step 1: Run Azure Setup (10 minutes)

```bash
# Make executable
chmod +x azure-setup.sh

# Run setup
./azure-setup.sh
```

This creates:
- Storage Account (decklists, logos)
- Cosmos DB (FREE tier - bracket data)
- Function App (serverless API)
- Managed Identity (secure access)
- Action Group (alerts)
- Metric alerts

**Output:** `azure-config.txt` with all resource names

---

### Step 2: Deploy Functions (5 minutes)

```bash
# Navigate to functions
cd functions

# Install dependencies
npm install

# Get your Function App name from azure-config.txt
FUNC_APP="your-function-app-name"

# Deploy
func azure functionapp publish $FUNC_APP
```

**Output:** 3 API endpoints ready to use

---

### Step 3: Set Up Budget (5 minutes)

**Manual step in Azure Portal:**

Follow: `BUDGET_SETUP.md`

1. Create $5/month budget
2. Set 4 alert thresholds (50%, 80%, 90%, 100%)
3. Link to Action Group

---

## 🎓 What You'll Learn (Azure Certifications)

This project covers key topics from:

### **AZ-900 (Fundamentals)**
- ✅ Storage types (Blob, Cosmos DB)
- ✅ Serverless computing (Functions)
- ✅ Cost management
- ✅ PaaS services

### **AZ-204 (Developer Associate)**
- ✅ Implement Azure Functions
- ✅ Develop for Azure storage
- ✅ Azure Cosmos DB solutions
- ✅ Managed Identity security
- ✅ Monitoring and optimization

### **AZ-104 (Administrator)**
- ✅ Manage identities (Managed Identity)
- ✅ Implement storage
- ✅ Deploy compute resources
- ✅ Monitor resources
- ✅ Cost management

---

## 🛡️ Cost Protections Built-In

### Free Tier Usage
| Service | Free Tier | Our Configuration |
|---------|-----------|-------------------|
| **Functions** | 1M executions/month | ✓ Consumption plan |
| **Cosmos DB** | 400 RU/s, 25GB | ✓ Fixed at 400 RU/s |
| **Static Web App** | Free forever | ✓ Free tier |
| **Blob Storage** | Pay-as-go | ~$0.10-2/month |

### Rate Limiting
- Upload: 1000 files/month max
- Save bracket: 500/month max
- File size: 10MB max per file
- Function timeout: 5 minutes
- Max concurrent requests: 50

### Budget Alerts
- 50% ($2.50) - Email warning
- 80% ($4.00) - Email warning
- 90% ($4.50) - Email + Action Group
- 100% ($5.00) - Email + Action Group

### Hard Limits
- Cosmos DB: **Cannot exceed** 400 RU/s (free tier)
- Function scaling: Max 3 instances
- Blob lifecycle: Auto-delete files > 1 year

---

## 📊 Expected Costs

### Normal Usage (10-50 users/month):
```
Functions:        $0.00  ← Free tier
Cosmos DB:        $0.00  ← Free tier
Blob Storage:     $0.10
------------------------
Total:            $0.10/month
```

### High Usage (500 users/month):
```
Functions:        $0.00  ← Still under 1M free
Cosmos DB:        $0.00  ← Fixed at free tier
Blob Storage:     $2.00
------------------------
Total:            $2.00/month
```

---

## ✅ Post-Setup Checklist

After running all setup steps:

### Azure Resources
- [ ] Resource group created: `bracket-manager-rg`
- [ ] Storage account with containers (decklists, logos)
- [ ] Cosmos DB with free tier enabled (400 RU/s)
- [ ] Function App deployed with 3 functions
- [ ] Managed Identity configured
- [ ] Permissions granted (Storage, Cosmos DB)

### Cost Protection
- [ ] Budget created ($5/month)
- [ ] 4 alerts configured
- [ ] Action Group linked
- [ ] Metric alerts set (Cosmos DB RU)
- [ ] Rate limiting verified in function code

### Deployment
- [ ] Functions deployed and accessible
- [ ] Test upload works
- [ ] Test save bracket works
- [ ] Test load bracket works
- [ ] Frontend updated with API calls

### Monitoring
- [ ] Cost Analysis dashboard bookmarked
- [ ] Function App logs accessible
- [ ] Email alerts configured
- [ ] azure-config.txt saved securely

---

## 🎯 Next Steps

1. **Run `azure-setup.sh`** (creates all resources)
2. **Deploy functions** (see DEPLOYMENT_GUIDE.md)
3. **Set up budget** (see BUDGET_SETUP.md)
4. **Test all endpoints** (verification tests above)
5. **Update frontend** (integrate API calls)
6. **Monitor costs weekly** (Cost Analysis)

---

## 💡 Summary

You now have:
- ✅ Production-ready Azure infrastructure
- ✅ Free tier optimization
- ✅ Cost protections in place
- ✅ Hands-on experience with key Azure services
- ✅ Certification-relevant skills
- ✅ Scalable architecture

**Total setup time:** ~30 minutes
**Monthly cost:** $0.10 - $2.00
**Learning value:** Priceless! 🎓

Good luck with your Azure certifications! 🚀
