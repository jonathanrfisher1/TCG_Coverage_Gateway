const { CosmosClient } = require("@azure/cosmos");
const { DefaultAzureCredential } = require("@azure/identity");

// Monthly bracket save limit (cost protection)
const MONTHLY_SAVE_LIMIT = 500;

module.exports = async function (context, req) {
    context.log('SaveBracket function triggered');
    
    try {
        const bracketData = req.body;
        
        // Validation
        if (!bracketData || !bracketData.title) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: "Bracket data with title is required" })
            };
            return;
        }
        
        // Rate limiting check
        const usage = await getMonthlySaveCount(context);
        
        if (usage >= MONTHLY_SAVE_LIMIT) {
            context.log.warn(`Monthly save limit reached: ${usage}/${MONTHLY_SAVE_LIMIT}`);
            context.res = {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: "Monthly bracket save limit reached. Please try again next month.",
                    limit: MONTHLY_SAVE_LIMIT,
                    current: usage
                })
            };
            return;
        }
        
        // Use Managed Identity
        const credential = new DefaultAzureCredential();
        const client = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            aadCredentials: credential
        });
        
        const database = client.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);
        
        // Generate unique ID
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 11);
        const id = `bracket_${timestamp}_${randomStr}`;
        
        const bracket = {
            id: id,
            title: bracketData.title,
            config: bracketData.config || {},
            teams: bracketData.teams || [],
            winners: bracketData.winners || {},
            decklists: bracketData.decklists || {},
            logoData: bracketData.logoData || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: "2.0"
        };
        
        // Create document
        const { resource } = await container.items.create(bracket);
        
        // Increment save counter
        await incrementSaveCount(context);
        
        const siteUrl = process.env.SITE_URL || 'https://yoursite.azurestaticapps.net';
        const shareUrl = `${siteUrl}/tools/bracket-manager?id=${resource.id}`;
        
        context.log(`Bracket saved successfully: ${resource.id}`);
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                id: resource.id,
                url: shareUrl,
                createdAt: resource.createdAt,
                saveCount: usage + 1,
                limit: MONTHLY_SAVE_LIMIT
            })
        };
        
    } catch (error) {
        context.log.error('Save bracket failed:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: "Failed to save bracket. Please try again.",
                details: error.message
            })
        };
    }
};

// Helper: Get monthly save count
async function getMonthlySaveCount(context) {
    try {
        const credential = new DefaultAzureCredential();
        const client = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            aadCredentials: credential
        });
        
        const database = client.database(process.env.COSMOS_DATABASE);
        const container = database.container("Usage");
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        try {
            const { resource } = await container.item(currentMonth, currentMonth).read();
            return resource?.saveCount || 0;
        } catch (error) {
            if (error.code === 404) {
                return 0;
            }
            throw error;
        }
    } catch (error) {
        context.log.error('Error getting save count:', error);
        return 0;
    }
}

// Helper: Increment monthly save count
async function incrementSaveCount(context) {
    try {
        const credential = new DefaultAzureCredential();
        const client = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            aadCredentials: credential
        });
        
        const database = client.database(process.env.COSMOS_DATABASE);
        
        // Create Usage container if it doesn't exist
        try {
            await database.containers.createIfNotExists({
                id: "Usage",
                partitionKey: { paths: ["/id"] }
            });
        } catch (error) {
            context.log.warn('Usage container may already exist');
        }
        
        const container = database.container("Usage");
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        try {
            const { resource } = await container.item(currentMonth, currentMonth).read();
            resource.saveCount = (resource.saveCount || 0) + 1;
            resource.lastUpdated = new Date().toISOString();
            await container.item(currentMonth, currentMonth).replace(resource);
        } catch (error) {
            if (error.code === 404) {
                await container.items.create({
                    id: currentMonth,
                    saveCount: 1,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        context.log.error('Error incrementing save count:', error);
    }
}
