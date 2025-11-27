const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");
const multipart = require("parse-multipart");
const { CosmosClient } = require("@azure/cosmos");

// Monthly upload limits (cost protection)
const MONTHLY_UPLOAD_LIMIT = 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

module.exports = async function (context, req) {
    context.log('Upload function triggered');
    
    try {
        // Rate limiting check
        const usage = await getMonthlyUploadCount(context);
        
        if (usage >= MONTHLY_UPLOAD_LIMIT) {
            context.log.warn(`Monthly upload limit reached: ${usage}/${MONTHLY_UPLOAD_LIMIT}`);
            context.res = {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: "Monthly upload limit reached. Please contact support or try again next month.",
                    limit: MONTHLY_UPLOAD_LIMIT,
                    current: usage,
                    resetDate: getNextMonthDate()
                })
            };
            return;
        }
        
        // Parse multipart form data
        const boundary = multipart.getBoundary(req.headers['content-type']);
        if (!boundary) {
            context.res = {
                status: 400,
                body: JSON.stringify({ error: "Invalid content type" })
            };
            return;
        }
        
        const parts = multipart.Parse(Buffer.from(req.body), boundary);
        
        if (!parts || parts.length === 0) {
            context.res = {
                status: 400,
                body: JSON.stringify({ error: "No file uploaded" })
            };
            return;
        }
        
        const file = parts[0];
        
        // File size check
        if (file.data.length > MAX_FILE_SIZE) {
            context.res = {
                status: 413,
                body: JSON.stringify({ 
                    error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                    size: file.data.length,
                    maxSize: MAX_FILE_SIZE
                })
            };
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            context.res = {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.",
                    receivedType: file.type
                })
            };
            return;
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = file.filename.split('.').pop();
        const fileName = `${timestamp}_${randomStr}.${fileExtension}`;
        
        // Use Managed Identity (no connection strings!)
        const credential = new DefaultAzureCredential();
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        
        const blobServiceClient = new BlobServiceClient(
            `https://${storageAccountName}.blob.core.windows.net`,
            credential
        );
        
        // Determine container based on file type
        const containerName = file.type === 'application/pdf' || file.type.startsWith('image/') 
            ? 'decklists' 
            : 'logos';
        
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        
        // Upload with metadata
        await blockBlobClient.upload(file.data, file.data.length, {
            blobHTTPHeaders: {
                blobContentType: file.type,
                blobCacheControl: 'public, max-age=31536000' // Cache for 1 year
            },
            metadata: {
                uploadedAt: new Date().toISOString(),
                originalName: file.filename,
                fileSize: file.data.length.toString()
            }
        });
        
        // Increment usage counter
        await incrementUploadCount(context);
        
        // Return public URL
        const url = blockBlobClient.url;
        
        context.log(`File uploaded successfully: ${fileName}`);
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                url: url,
                fileName: fileName,
                originalName: file.filename,
                size: file.data.length,
                uploadCount: usage + 1,
                limit: MONTHLY_UPLOAD_LIMIT
            })
        };
        
    } catch (error) {
        context.log.error('Upload failed:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: "Upload failed. Please try again.",
                details: error.message
            })
        };
    }
};

// Helper: Get monthly upload count from Cosmos DB
async function getMonthlyUploadCount(context) {
    try {
        const credential = new DefaultAzureCredential();
        const client = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            aadCredentials: credential
        });
        
        const database = client.database(process.env.COSMOS_DATABASE);
        const container = database.container("Usage");
        
        const currentMonth = new Date().toISOString().slice(0, 7); // "2024-12"
        
        try {
            const { resource } = await container.item(currentMonth, currentMonth).read();
            return resource?.uploadCount || 0;
        } catch (error) {
            if (error.code === 404) {
                return 0; // No usage record yet
            }
            throw error;
        }
    } catch (error) {
        context.log.error('Error getting upload count:', error);
        return 0; // Fail open to not block uploads
    }
}

// Helper: Increment monthly upload count
async function incrementUploadCount(context) {
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
            context.log.warn('Usage container may already exist:', error.message);
        }
        
        const container = database.container("Usage");
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        try {
            // Try to read existing record
            const { resource } = await container.item(currentMonth, currentMonth).read();
            
            // Increment count
            resource.uploadCount = (resource.uploadCount || 0) + 1;
            resource.lastUpdated = new Date().toISOString();
            
            await container.item(currentMonth, currentMonth).replace(resource);
        } catch (error) {
            if (error.code === 404) {
                // Create new record
                await container.items.create({
                    id: currentMonth,
                    uploadCount: 1,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        context.log.error('Error incrementing upload count:', error);
        // Don't fail the upload if we can't track usage
    }
}

// Helper: Get next month date for reset message
function getNextMonthDate() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString().split('T')[0];
}
