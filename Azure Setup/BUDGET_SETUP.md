# Manual Budget Setup Guide

## 🎯 Goal
Set up a $5/month budget with automated alerts to prevent unexpected costs.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Azure Cost Management

1. Go to: https://portal.azure.com
2. Search for "Cost Management" in the top search bar
3. Click **"Cost Management + Billing"**
4. In the left menu, click **"Cost Management"**
5. Click **"Budgets"**

**Or direct link:** https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/budgets

---

### Step 2: Create Budget

Click **"+ Add"** button

**Basic Settings:**
- **Name:** `BracketManagerBudget`
- **Reset period:** `Monthly`
- **Creation date:** Today's date
- **Expiration date:** 1 year from now
- **Amount:** `$5.00`

**Scope:**
- **Subscription:** Your subscription
- **Resource group:** `bracket-manager-rg` (select from dropdown)

Click **"Next"**

---

### Step 3: Set Alert Conditions

Create **4 alert thresholds**:

#### Alert 1: 50% Warning
- **% of budget:** `50`
- **Threshold value:** `$2.50`
- **Alert recipients (email):** Your email address
- **Alert recipient (action group):** Leave empty for now

#### Alert 2: 80% Warning
- **% of budget:** `80`
- **Threshold value:** `$4.00`
- **Alert recipients (email):** Your email address
- **Alert recipient (action group):** Leave empty

#### Alert 3: 90% Critical
- **% of budget:** `90`
- **Threshold value:** `$4.50`
- **Alert recipients (email):** Your email address
- **Alert recipient (action group):** `BracketAlerts` (select from dropdown)
- **Language:** English

#### Alert 4: 100% Critical
- **% of budget:** `100`
- **Threshold value:** `$5.00`
- **Alert recipients (email):** Your email address
- **Alert recipient (action group):** `BracketAlerts` (select from dropdown)
- **Language:** English

Click **"Create"**

---

### Step 4: Verify Budget

After creation, you should see:

```
Budget Name: BracketManagerBudget
Amount: $5.00 per month
Current spend: $0.00 (0%)
Alerts: 4 configured
Status: Active
```

---

### Step 5: Test Alert (Optional)

**Manual test:**
1. Go to your budget
2. Click **"Alerts"**
3. Find alert configuration
4. There's no direct test button, but alerts will trigger when thresholds are met

**Wait for natural costs:**
- Alerts will trigger when your spending hits thresholds
- First alert at $2.50 (50%)
- You'll receive emails at each threshold

---

## 📧 What Alerts Look Like

### Email Alert Example:

```
Subject: Azure Budget Alert: BracketManagerBudget - 90% of budget

You have exceeded 90% of your budget for BracketManagerBudget.

Current spend: $4.52
Budget amount: $5.00
Percentage: 90.4%

View details: [Link to Azure Portal]
```

### Action Group (90% and 100% alerts):
- Email sent to you
- Webhook can trigger emergency shutdown (future enhancement)

---

## 🛡️ Additional Protection: Spending Limit

### For Pay-As-You-Go Subscriptions:

1. Go to: https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade
2. Select your subscription
3. Click **"Payment methods"**
4. Look for **"Spending limit"**
5. If available, set spending limit

**Note:** 
- Free trial accounts have spending limits by default
- Pay-As-You-Go accounts don't have hard spending limits
- This is why budgets with alerts are critical!

---

## 📊 Monitor Costs Weekly

### Quick Check:
1. Azure Portal → Cost Management
2. Cost Analysis → View
3. Set filter: Resource group = `bracket-manager-rg`
4. Time range: Last 7 days

### What to Look For:
- **Cosmos DB:** Should be $0 (free tier)
- **Functions:** Should be $0 (under 1M executions)
- **Blob Storage:** Should be < $1
- **Total:** Should be < $2/month

---

## 🚨 What to Do If Budget Exceeded

### If 90% Alert Triggered ($4.50):

**Immediate actions:**
1. Check Cost Analysis to see what's expensive
2. Review Azure Portal → All Resources
3. Check Function App execution count
4. Check Cosmos DB RU/s (should be 400)

**Likely causes:**
- Function App scaled too high (check logs)
- Someone triggered many uploads
- Cosmos DB set above 400 RU/s accidentally

**Fix:**
```bash
# Stop Function App temporarily
az functionapp stop \
  --name your-func-app \
  --resource-group bracket-manager-rg

# Verify Cosmos DB throughput
az cosmosdb sql container throughput show \
  --account-name your-cosmos \
  --database-name BracketManager \
  --resource-group bracket-manager-rg \
  --name Brackets

# If above 400, reset to 400
az cosmosdb sql container throughput update \
  --account-name your-cosmos \
  --database-name BracketManager \
  --resource-group bracket-manager-rg \
  --name Brackets \
  --throughput 400
```

---

### If 100% Alert Triggered ($5.00):

**Emergency shutdown:**
1. Stop Function App (command above)
2. Investigate costs immediately
3. Fix root cause
4. Restart Function App when safe

---

## 💰 Expected Monthly Costs

### Normal Usage (10-50 users/month):
```
Functions:        $0.00  (under free tier)
Cosmos DB:        $0.00  (free tier)
Blob Storage:     $0.10 - $0.50
----------------------
Total:            $0.10 - $0.50/month
```

### High Usage (100-500 users/month):
```
Functions:        $0.00  (still under free tier)
Cosmos DB:        $0.00  (free tier)
Blob Storage:     $1.00 - $3.00
----------------------
Total:            $1.00 - $3.00/month
```

### Viral Spike (5000+ users/month):
**Without protections:**
```
Functions:        $5-10  (may exceed free tier)
Cosmos DB:        $50+   (if autoscale enabled)
Blob Storage:     $10+
----------------------
Total:            $65+/month  ⚠️
```

**With protections (our setup):**
```
Functions:        $0-2   (rate limited)
Cosmos DB:        $0     (fixed at 400 RU/s)
Blob Storage:     $5-10  (many uploads)
----------------------
Total:            $5-12/month  ✓
```

Your budget will alert you before this happens!

---

## 🎓 Learning Opportunity

This budget setup teaches:
- ✅ Azure Cost Management
- ✅ Alert conditions
- ✅ Action Groups
- ✅ Cost analysis
- ✅ Budget thresholds

**Relevant for certifications:**
- AZ-900: Cost management concepts
- AZ-104: Cost management and governance
- AZ-204: Monitoring and optimization

---

## ✅ Verification Checklist

After setup, confirm:
- [ ] Budget shows "Active" status
- [ ] 4 alerts configured (50%, 80%, 90%, 100%)
- [ ] Email alerts enabled
- [ ] Action Group linked to 90% and 100% alerts
- [ ] Expiration date is 1 year from now
- [ ] Resource group filter is correct

---

## 📞 Support

If costs exceed budget unexpectedly:
1. Check Cost Analysis immediately
2. Stop affected services
3. Open Azure support ticket (if needed)
4. Document what happened for learning

Remember: Budgets send alerts but **don't stop services automatically**. That's why we have:
- Rate limiting in code (1000 uploads/month)
- Fixed Cosmos DB throughput (400 RU/s)
- Limited Function App scaling (max 3 instances)
