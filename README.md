# TCG Coverage Gateway

A Trading Card Game coverage gateway and data management system with support for storing decklists (PNG/PDF) and managing TCG coverage data.

## Features

- **Database**: PostgreSQL via Supabase (500MB free tier)
- **File Storage**: PNG and PDF storage via Supabase Storage (1GB free tier)
- **RESTful API**: Express.js backend with structured endpoints
- **File Management**: Upload, store, and retrieve decklist images and PDFs
- **Multi-TCG Support**: Pokemon, Magic: The Gathering, Yu-Gi-Oh, and more
- **Coverage Tracking**: Event coverage and tournament reporting

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (PNG/PDF files)
- **Authentication**: Supabase Auth (ready to use)

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account (free tier)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/jonathanrfisher1/TCG_Coverage_Gateway.git
cd TCG_Coverage_Gateway
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings > API
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Set Up Database

1. Go to Supabase Dashboard > SQL Editor
2. Run the migration files in order:
   - `migrations/sql/001_initial_schema.sql`
   - `migrations/sql/002_storage_buckets.sql`

### 5. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### API Info
```
GET /api/v1
```

### Planned Endpoints
- `GET /api/v1/cards` - List all cards
- `POST /api/v1/cards` - Create a new card
- `GET /api/v1/decklists` - List all decklists
- `POST /api/v1/decklists` - Create a new decklist
- `POST /api/v1/upload` - Upload PNG/PDF files
- `GET /api/v1/coverage` - List coverage events

## Project Structure

```
TCG_Coverage_Gateway/
├── src/
│   ├── api/
│   │   ├── routes/         # API route handlers
│   │   └── middleware/     # Express middleware
│   ├── services/
│   │   ├── supabase.js     # Supabase client setup
│   │   ├── storage.js      # File storage operations
│   │   └── database.js     # Database queries
│   ├── models/             # Data models
│   ├── utils/              # Utility functions
│   └── index.js            # Application entry point
├── tests/                  # Unit and integration tests
├── migrations/             # Database migrations
├── config/                 # Configuration files
└── docs/                   # Documentation
```

## Database Schema

### Tables

**cards**
- Stores TCG card information
- Supports multiple TCG types (Pokemon, Magic, Yu-Gi-Oh)
- JSONB metadata for flexible attributes

**decklists**
- Stores decklist information
- Links to PNG images and PDF exports
- Supports deck composition via JSONB

**coverage_events**
- Tournament and event coverage
- Links to PDF coverage reports
- Date-based event tracking

**users**
- User management
- Links to decklists

### Storage Buckets

- `decklists-images/` - PNG decklist images (max 10MB per file)
- `decklists-pdfs/` - PDF decklist exports
- `coverage-reports/` - PDF tournament reports
- `card-scans/` - PNG card images

## File Upload

### Supported File Types
- PNG images (`image/png`)
- PDF documents (`application/pdf`)

### File Size Limits
- Maximum: 10MB per file (configurable via `MAX_FILE_SIZE`)

### Upload Example
```javascript
// Using FormData
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'decklist');

fetch('/api/v1/upload', {
  method: 'POST',
  body: formData
});
```

## Free Tier Limits

**Supabase Free Tier:**
- Database: 500MB storage
- File Storage: 1GB storage
- Bandwidth: 5GB/month
- API Requests: Unlimited (with rate limiting)

**Best Practices:**
- Optimize PNG images before upload
- Compress PDFs when possible
- Implement pagination for large datasets
- Monitor usage via Supabase Dashboard

## Development

### Run Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Environment Variables

See `.env.example` for all available configuration options.

Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

Optional:
- `PORT` - Server port (default: 3000)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 10MB)
- `ALLOWED_FILE_TYPES` - Comma-separated MIME types

## Deployment

This application can be deployed to:
- **Vercel** - Serverless functions
- **Railway** - Container deployment
- **Render** - Free tier available
- **Fly.io** - Free tier available

All use the same Supabase backend (no separate database hosting needed).

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Create focused, atomic commits

## License

MIT

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For issues and questions, please use the GitHub issue tracker.
