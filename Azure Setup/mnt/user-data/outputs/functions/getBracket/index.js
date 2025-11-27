const { CosmosClient } = require("@azure/cosmos");
const { DefaultAzureCredential } = require("@azure/identity");

module.exports = async function (context, req) {
    context.log('GetBracket function triggered');
    
    try {
        const bracketId = req.query.id || (req.params && req.params.id);
        
        if (!bracketId) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: "Bracket ID is required" })
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
        
        // Point read (1 RU - most efficient!)
        try {
            const { resource } = await container.item(bracketId, bracketId).read();
            
            if (!resource) {
                context.res = {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: "Bracket not found",
                        id: bracketId
                    })
                };
                return;
            }
            
            context.log(`Bracket retrieved successfully: ${bracketId}`);
            
            context.res = {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
                },
                body: JSON.stringify({
                    success: true,
                    bracket: resource
                })
            };
            
        } catch (error) {
            if (error.code === 404) {
                context.res = {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: "Bracket not found",
                        id: bracketId
                    })
                };
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        context.log.error('Get bracket failed:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: "Failed to retrieve bracket. Please try again.",
                details: error.message
            })
        };
    }
};
