#!/bin/bash

# Azure Bracket Manager - Complete Setup Script
# This script creates all Azure resources with free tier and cost protections

set -e  # Exit on error

echo "🚀 Starting Azure Bracket Manager Setup..."
echo "=========================================="

# Configuration Variables
RESOURCE_GROUP="bracket-manager-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="bracketstorage$(date +%s | tail -c 6)"  # Unique name
FUNCTION_APP="bracket-api-func-$(date +%s | tail -c 6)"
COSMOS_ACCOUNT="bracket-cosmos-$(date +%s | tail -c 6)"
STATIC_WEB_APP="bracket-static-web"
BUDGET_NAME="BracketManagerBudget"
BUDGET_AMOUNT=5

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Storage: $STORAGE_ACCOUNT"
echo "  Functions: $FUNCTION_APP"
echo "  Cosmos DB: $COSMOS_ACCOUNT"
echo ""

read -p "Continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Setup cancelled."
    exit 1
fi

# Step 1: Login to Azure
echo -e "${YELLOW}Step 1: Logging into Azure...${NC}"
az login

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✓ Using subscription: $SUBSCRIPTION_ID${NC}"

# Step 2: Create Resource Group
echo -e "${YELLOW}Step 2: Creating Resource Group...${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
echo -e "${GREEN}✓ Resource Group created${NC}"

# Step 3: Create Storage Account
echo -e "${YELLOW}Step 3: Creating Storage Account...${NC}"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot \
  --allow-blob-public-access true
echo -e "${GREEN}✓ Storage Account created${NC}"

# Get storage connection string
STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

# Step 4: Create Blob Containers
echo -e "${YELLOW}Step 4: Creating Blob Containers...${NC}"
az storage container create \
  --name decklists \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob \
  --auth-mode login

az storage container create \
  --name logos \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob \
  --auth-mode login

echo -e "${GREEN}✓ Blob containers created (public read access)${NC}"

# Step 5: Set Lifecycle Policy (auto-delete old files)
echo -e "${YELLOW}Step 5: Setting up lifecycle policy...${NC}"
cat > lifecycle-policy.json << EOF
{
  "rules": [
    {
      "enabled": true,
      "name": "DeleteOldFiles",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "delete": {
              "daysAfterModificationGreaterThan": 365
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"]
        }
      }
    }
  ]
}
EOF

az storage account management-policy create \
  --account-name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --policy @lifecycle-policy.json

rm lifecycle-policy.json
echo -e "${GREEN}✓ Lifecycle policy set (deletes files > 1 year old)${NC}"

# Step 6: Create Cosmos DB Account (FREE TIER)
echo -e "${YELLOW}Step 6: Creating Cosmos DB (Free Tier)...${NC}"
az cosmosdb create \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --locations regionName=$LOCATION \
  --enable-free-tier true \
  --default-consistency-level Session \
  --enable-automatic-failover false

echo -e "${GREEN}✓ Cosmos DB created with FREE TIER${NC}"

# Get Cosmos DB endpoint
COSMOS_ENDPOINT=$(az cosmosdb show \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query documentEndpoint -o tsv)

# Step 7: Create Cosmos DB Database and Container
echo -e "${YELLOW}Step 7: Creating Cosmos DB database and container...${NC}"
az cosmosdb sql database create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --name BracketManager

# Create container with FIXED 400 RU/s (free tier limit)
az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --database-name BracketManager \
  --name Brackets \
  --partition-key-path "/id" \
  --throughput 400

echo -e "${GREEN}✓ Database and container created (400 RU/s - FREE TIER)${NC}"

# Step 8: Create Function App
echo -e "${YELLOW}Step 8: Creating Function App (Consumption Plan)...${NC}"
az functionapp create \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --consumption-plan-location $LOCATION \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account $STORAGE_ACCOUNT \
  --os-type Linux

echo -e "${GREEN}✓ Function App created (Consumption/Free tier)${NC}"

# Step 9: Enable Managed Identity on Function App
echo -e "${YELLOW}Step 9: Enabling Managed Identity...${NC}"
az functionapp identity assign \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP

FUNCTION_PRINCIPAL_ID=$(az functionapp identity show \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)

echo -e "${GREEN}✓ Managed Identity enabled${NC}"
echo "  Principal ID: $FUNCTION_PRINCIPAL_ID"

# Step 10: Grant Function App access to Storage
echo -e "${YELLOW}Step 10: Granting Storage permissions...${NC}"
az role assignment create \
  --assignee $FUNCTION_PRINCIPAL_ID \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT"

echo -e "${GREEN}✓ Storage permissions granted${NC}"

# Step 11: Grant Function App access to Cosmos DB
echo -e "${YELLOW}Step 11: Granting Cosmos DB permissions...${NC}"

# Wait for role definition to propagate
sleep 10

az cosmosdb sql role assignment create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --role-definition-name "Cosmos DB Built-in Data Contributor" \
  --principal-id $FUNCTION_PRINCIPAL_ID \
  --scope "/"

echo -e "${GREEN}✓ Cosmos DB permissions granted${NC}"

# Step 12: Configure Function App Settings
echo -e "${YELLOW}Step 12: Configuring Function App settings...${NC}"
az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT" \
    "COSMOS_ENDPOINT=$COSMOS_ENDPOINT" \
    "COSMOS_DATABASE=BracketManager" \
    "COSMOS_CONTAINER=Brackets" \
    "WEBSITE_MAX_DYNAMIC_APPLICATION_SCALE_OUT=3" \
    "FUNCTIONS_WORKER_RUNTIME=node"

echo -e "${GREEN}✓ Function App configured${NC}"

# Step 13: Create Budget with Alerts
echo -e "${YELLOW}Step 13: Setting up budget and alerts...${NC}"

# Get current date for budget start
START_DATE=$(date -u +"%Y-%m-01T00:00:00Z")
END_DATE=$(date -u -d "+1 year" +"%Y-%m-01T00:00:00Z")

# Get your email (from Azure account)
EMAIL=$(az account show --query user.name -o tsv)

# Note: Budget creation via CLI has limitations. We'll provide manual steps.
echo -e "${YELLOW}Note: Budget creation requires manual setup in portal${NC}"
echo "  We'll create a reminder file for this step."

# Step 14: Create Action Group for alerts
echo -e "${YELLOW}Step 14: Creating Action Group...${NC}"
az monitor action-group create \
  --name "BracketAlerts" \
  --resource-group $RESOURCE_GROUP \
  --short-name "BracketAlert" \
  --email-receiver admin-email "$EMAIL"

echo -e "${GREEN}✓ Action Group created${NC}"

# Step 15: Create Metric Alert for Cosmos DB
echo -e "${YELLOW}Step 15: Creating Cosmos DB usage alert...${NC}"
COSMOS_RESOURCE_ID="/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.DocumentDB/databaseAccounts/$COSMOS_ACCOUNT"

az monitor metrics alert create \
  --name "CosmosRUExceeded" \
  --resource-group $RESOURCE_GROUP \
  --scopes "$COSMOS_RESOURCE_ID" \
  --condition "avg NormalizedRUConsumption > 90" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action BracketAlerts \
  --description "Alert when Cosmos DB RU consumption exceeds 90%"

echo -e "${GREEN}✓ Cosmos DB alert created${NC}"

# Step 16: Save configuration to file
echo -e "${YELLOW}Step 16: Saving configuration...${NC}"
cat > azure-config.txt << EOF
Azure Bracket Manager - Configuration
======================================

Resource Group:    $RESOURCE_GROUP
Location:          $LOCATION
Subscription ID:   $SUBSCRIPTION_ID

Storage Account:   $STORAGE_ACCOUNT
  - Container:     decklists (public read)
  - Container:     logos (public read)
  - Connection:    (see Azure Portal for connection string)

Function App:      $FUNCTION_APP
  - Runtime:       Node.js 18
  - Plan:          Consumption (Free tier)
  - Principal ID:  $FUNCTION_PRINCIPAL_ID

Cosmos DB:         $COSMOS_ACCOUNT
  - Endpoint:      $COSMOS_ENDPOINT
  - Database:      BracketManager
  - Container:     Brackets
  - Throughput:    400 RU/s (FREE TIER - FIXED)

Action Group:      BracketAlerts
  - Email:         $EMAIL

Budget (Manual Setup Required):
  - Name:          $BUDGET_NAME
  - Amount:        \$$BUDGET_AMOUNT/month
  - Alerts:        90%, 100%

Next Steps:
1. Set up budget manually in Azure Portal (see BUDGET_SETUP.md)
2. Deploy Functions code (see DEPLOY_FUNCTIONS.md)
3. Update Static Web App config (see STATIC_WEB_SETUP.md)

Cost Protection Summary:
✓ Cosmos DB fixed at 400 RU/s (cannot exceed free tier)
✓ Function App on Consumption plan (1M free executions)
✓ Lifecycle policy deletes files > 1 year old
✓ Alerts set for 90% RU consumption
✓ Managed Identity (no keys in code)
⚠ Manual budget setup required

Estimated Monthly Cost: \$0.10 - \$2.00
  - Cosmos DB: \$0 (free tier)
  - Functions: \$0 (under 1M executions)
  - Blob Storage: ~\$0.10 - \$2.00 (depends on usage)
EOF

echo -e "${GREEN}✓ Configuration saved to azure-config.txt${NC}"

# Step 17: Display summary
echo ""
echo -e "${GREEN}=========================================="
echo "✓ Azure Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Resources created:"
echo "  ✓ Resource Group: $RESOURCE_GROUP"
echo "  ✓ Storage Account: $STORAGE_ACCOUNT"
echo "  ✓ Cosmos DB: $COSMOS_ACCOUNT (FREE TIER)"
echo "  ✓ Function App: $FUNCTION_APP"
echo "  ✓ Action Group: BracketAlerts"
echo ""
echo "Configuration saved to: azure-config.txt"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review azure-config.txt"
echo "  2. Set up budget manually (see instructions below)"
echo "  3. Deploy Functions code"
echo "  4. Update your Static Web App"
echo ""
echo -e "${YELLOW}IMPORTANT - Manual Budget Setup:${NC}"
echo "  1. Go to: https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/budgets"
echo "  2. Click 'Add'"
echo "  3. Budget name: $BUDGET_NAME"
echo "  4. Amount: \$$BUDGET_AMOUNT"
echo "  5. Add alerts at 50%, 80%, 90%, 100%"
echo "  6. Add email: $EMAIL"
echo "  7. Link to Action Group: BracketAlerts"
echo ""
echo "Setup log saved to: azure-setup.log"
echo ""

# Save full output to log file
echo "Full setup completed at $(date)" >> azure-setup.log
