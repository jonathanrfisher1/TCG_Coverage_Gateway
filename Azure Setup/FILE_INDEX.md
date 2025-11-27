# File Index - What Each File Does

## 📂 Project Structure

```
bracket-manager/
├── azure-setup.sh                    ← RUN THIS FIRST
├── AZURE_SETUP_README.md            ← Start here - overview
├── DEPLOYMENT_GUIDE.md              ← Step-by-step deployment
├── BUDGET_SETUP.md                  ← Manual budget setup
├── QUICK_REFERENCE.md               ← Quick commands
├── .gitignore                       ← Git safety
├── functions/                       ← Functions code
│   ├── package.json                 ← Dependencies
│   ├── host.json                    ← Function app config
│   ├── upload/
│   │   ├── index.js                 ← Upload file handler
│   │   └── function.json            ← Upload config
│   ├── saveBracket/
│   │   ├── index.js                 ← Save bracket handler
│   │   └── function.json            ← Save config
│   └── getBracket/
│       ├── index.js                 ← Load bracket handler
│       └── function.json            ← Load config
└── (after setup)
    └── azure-config.txt             ← YOUR resource names
```

---

## 🎯 Quick Start Path

Follow in this order:

### 1. Read First
- **AZURE_SETUP_README.md** - Understand what you're building

### 2. Run Setup
- **azure-setup.sh** - Creates all Azure resources
- Takes ~10 minutes
- Outputs: `azure-config.txt`

### 3. Deploy Code
- **DEPLOYMENT_GUIDE.md** - Follow deployment steps
- Deploy functions to Azure
- Takes ~5 minutes

### 4. Configure Budget
- **BUDGET_SETUP.md** - Manual Azure Portal steps
- Set up cost alerts
- Takes ~5 minutes

### 5. Keep Handy
- **QUICK_REFERENCE.md** - Common commands and links

---

## 📄 File Descriptions

### Setup & Configuration

#### **azure-setup.sh** (MAIN SETUP SCRIPT)
- **Purpose:** Automates Azure resource creation
- **What it creates:**
  - Resource Group
  - Storage Account + Containers
  - Cosmos DB (free tier)
  - Function App
  - Managed Identity
  - Permissions
  - Alerts
- **Output:** azure-config.txt
- **When to run:** Once at project start
- **How to run:** `chmod +x azure-setup.sh && ./azure-setup.sh`

#### **.gitignore**
- **Purpose:** Prevents committing sensitive files
- **Protects:**
  - azure-config.txt (resource names)
  - node_modules
  - .env files
  - logs
- **When to use:** Copy to your project root

---

### Documentation

#### **AZURE_SETUP_README.md** (START HERE)
- **Purpose:** Complete overview of the project
- **Contains:**
  - What you're building
  - Quick start (3 steps)
  - Learning objectives
  - Cost information
  - Architecture diagram
  - Post-setup checklist
- **Read:** Before starting setup

#### **DEPLOYMENT_GUIDE.md**
- **Purpose:** Detailed deployment instructions
- **Contains:**
  - Step-by-step function deployment
  - Testing instructions
  - Frontend integration code
  - Troubleshooting guide
- **Use:** While deploying functions

#### **BUDGET_SETUP.md**
- **Purpose:** Manual budget configuration
- **Contains:**
  - Portal screenshots instructions
  - Alert threshold configuration
  - Cost monitoring setup
  - Emergency procedures
- **Use:** After Azure resources created

#### **QUICK_REFERENCE.md**
- **Purpose:** Quick commands and links
- **Contains:**
  - Common CLI commands
  - Test commands
  - Troubleshooting checklist
  - Important links
- **Use:** Keep open during work
- **Tip:** Print or bookmark this!

---

### Functions Code

#### **functions/package.json**
- **Purpose:** Node.js dependencies
- **Dependencies:**
  - @azure/cosmos (Cosmos DB SDK)
  - @azure/storage-blob (Blob Storage SDK)
  - @azure/identity (Managed Identity)
  - parse-multipart (File upload parsing)
- **When to use:** Run `npm install` before deploying

#### **functions/host.json**
- **Purpose:** Function App configuration
- **Settings:**
  - Timeout: 5 minutes
  - Max concurrent requests: 50
  - Rate limiting enabled
  - Logging configuration
- **Cost protection:** Limits resource usage

---

### Upload Function

#### **functions/upload/index.js**
- **Purpose:** Handle file uploads to Blob Storage
- **Features:**
  - Rate limiting (1000/month)
  - File size check (10MB max)
  - File type validation
  - Managed Identity authentication
  - Usage tracking in Cosmos DB
- **API:** POST /api/upload
- **Returns:** Blob Storage URL

#### **functions/upload/function.json**
- **Purpose:** Upload function configuration
- **Settings:**
  - HTTP trigger
  - POST method only
  - Route: /api/upload
  - Anonymous auth

---

### Save Bracket Function

#### **functions/saveBracket/index.js**
- **Purpose:** Save bracket data to Cosmos DB
- **Features:**
  - Rate limiting (500/month)
  - Data validation
  - Unique ID generation
  - Managed Identity authentication
  - Usage tracking
- **API:** POST /api/saveBracket
- **Returns:** Bracket ID and shareable URL

#### **functions/saveBracket/function.json**
- **Purpose:** Save function configuration
- **Settings:**
  - HTTP trigger
  - POST method only
  - Route: /api/saveBracket
  - Anonymous auth

---

### Get Bracket Function

#### **functions/getBracket/index.js**
- **Purpose:** Load bracket data from Cosmos DB
- **Features:**
  - Point read (1 RU - most efficient)
  - Caching headers (5 minutes)
  - Error handling
  - Managed Identity authentication
- **API:** GET /api/getBracket?id=XXX
- **Returns:** Complete bracket data

#### **functions/getBracket/function.json**
- **Purpose:** Get function configuration
- **Settings:**
  - HTTP trigger
  - GET method only
  - Route: /api/getBracket
  - Anonymous auth

---

## 🔄 Workflow

### First Time Setup
```
1. Read AZURE_SETUP_README.md
   ↓
2. Run azure-setup.sh
   ↓ (creates azure-config.txt)
3. Follow DEPLOYMENT_GUIDE.md
   ↓
4. Deploy functions (npm install, func publish)
   ↓
5. Follow BUDGET_SETUP.md
   ↓
6. Test endpoints
   ↓
7. Update frontend code
   ↓
8. Done! ✅
```

### Daily Development
```
1. Make code changes
   ↓
2. Test locally (func start)
   ↓
3. Deploy (func azure functionapp publish)
   ↓
4. Test in Azure
   ↓
5. Check costs (Cost Analysis)
```

### Weekly Maintenance
```
1. Check QUICK_REFERENCE.md
   ↓
2. Review Cost Analysis
   ↓
3. Check Function logs
   ↓
4. Verify budget status
```

---

## 🎓 Learning Path by File

### **If you're learning Azure basics:**
1. Start with AZURE_SETUP_README.md
2. Run azure-setup.sh (observe what it creates)
3. Follow DEPLOYMENT_GUIDE.md
4. Study the created resources in Azure Portal

### **If you're preparing for AZ-204:**
Focus on:
- functions/upload/index.js (Blob Storage SDK)
- functions/saveBracket/index.js (Cosmos DB SDK)
- functions/host.json (Function configuration)
- Managed Identity implementation

### **If you're preparing for AZ-104:**
Focus on:
- azure-setup.sh (Resource creation)
- BUDGET_SETUP.md (Cost management)
- Role assignments in setup script
- Monitoring and alerts

### **If you're preparing for AZ-900:**
Read:
- AZURE_SETUP_README.md (service overview)
- Cost protection sections
- Architecture diagrams
- Budget setup concepts

---

## 💾 What to Keep / What to Delete

### Keep in Version Control (Git)
✅ All .md documentation files
✅ functions/*.js code files
✅ functions/*.json config files
✅ azure-setup.sh
✅ .gitignore

### DO NOT Commit (Sensitive)
❌ azure-config.txt (has resource names)
❌ node_modules/
❌ .env files
❌ azure-setup.log
❌ Any files with keys/secrets

### Generated Files (Not in Git)
- azure-config.txt (created by setup script)
- azure-setup.log (created by setup script)
- node_modules/ (created by npm install)

---

## 📞 Which File for Which Problem?

**"How do I start?"**
→ AZURE_SETUP_README.md

**"Setup script failed"**
→ Check azure-setup.log
→ QUICK_REFERENCE.md troubleshooting

**"How do I deploy functions?"**
→ DEPLOYMENT_GUIDE.md

**"Costs are high"**
→ BUDGET_SETUP.md emergency procedures
→ QUICK_REFERENCE.md cost monitoring

**"Upload doesn't work"**
→ functions/upload/index.js (check logs)
→ DEPLOYMENT_GUIDE.md troubleshooting

**"Need a quick command"**
→ QUICK_REFERENCE.md

**"Forgot my resource names"**
→ azure-config.txt

---

## 🎯 Success Criteria

You've successfully set up everything when:

✅ All files present in project
✅ azure-setup.sh ran without errors
✅ azure-config.txt created
✅ Functions deployed (3 endpoints)
✅ Budget configured in portal
✅ All test commands return success
✅ Frontend integrated with APIs

---

## 📚 Additional Resources

**Microsoft Learn:**
- [Azure Functions](https://learn.microsoft.com/azure/azure-functions/)
- [Cosmos DB](https://learn.microsoft.com/azure/cosmos-db/)
- [Cost Management](https://learn.microsoft.com/azure/cost-management-billing/)

**Azure Documentation:**
- All links in AZURE_SETUP_README.md

---

**This file index should help you navigate the project!**

Questions? Check QUICK_REFERENCE.md or review azure-config.txt for your specific resource names.
