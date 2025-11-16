# TCG Coverage Gateway

A specialized platform for tournament coverage teams to manage TCG tournament data, import player decklists from various sources, and generate graphics for streaming and social media.

## Purpose

**This is a coverage team workflow tool - NOT a deck-building platform.**

Coverage teams work with decklist data that has already been submitted by players through tournament software. This platform helps you:

- Import decklist data from JSON exports, PNG screenshots, or PDF files
- Organize tournaments, players, and decklists
- Generate graphics for streaming overlays and social media
- Track featured matches and create coverage reports
- Manage coverage workflows efficiently

## Features

- **Multi-Format Import**: Accept decklists as JSON (from tournament software), PNG (screenshots), or PDF (exports)
- **Tournament Management**: Track events, players, standings, and match results
- **Graphics Generation**: Create stream overlays, deck profiles, and social media graphics
- **Free Tier Friendly**: Built entirely on free services (Supabase)
- **Coverage Team Focused**: Workflows designed for live tournament coverage

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL via Supabase (500MB free tier)
- **Storage**: Supabase Storage for files (1GB free tier)
  - PNG screenshots from tournament software
  - PDF decklist exports
  - JSON tournament data
  - Generated graphics
- **Authentication**: Supabase Auth (for coverage team access)

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

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy your project URL and API keys

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Set Up Database

1. Open Supabase Dashboard > SQL Editor
2. Run migrations in order:
   - `migrations/sql/001_initial_schema.sql`
   - `migrations/sql/002_storage_buckets.sql`

This creates:
- `tournaments` table - Event tracking
- `players` table - Tournament participants
- `decklists` table - Imported decklist data
- `generated_graphics` table - Created graphics metadata
- `matches` table - Match tracking (optional)
- Storage buckets for files

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs at `http://localhost:3000`

## Coverage Team Workflows

### Workflow 1: Import Tournament Data

1. **Create Tournament**
   ```
   POST /api/v1/tournaments
   {
     "name": "Regional Championship",
     "tcg_type": "Pokemon",
     "format": "Standard",
     "start_date": "2025-01-15"
   }
   ```

2. **Import Decklists**

   **From JSON** (e.g., from Limitless, Play! Pokemon):
   ```
   POST /api/v1/import/json
   {
     "tournament_id": "uuid",
     "json_data": { ... }
   }
   ```

   **From PNG/PDF**:
   ```
   POST /api/v1/import/file
   - Upload PNG screenshot or PDF export
   - Automatically stores in Supabase Storage
   - Creates decklist record with file URL
   ```

3. **Tag Featured Decklists**
   ```
   PATCH /api/v1/decklists/{id}
   {
     "featured": true,
     "tags": ["top8", "featured"]
   }
   ```

### Workflow 2: Generate Graphics

1. **Create Stream Overlay**
   ```
   POST /api/v1/graphics/generate
   {
     "type": "deck_profile",
     "decklist_id": "uuid",
     "template": "standard_overlay"
   }
   ```

2. **Access Generated Graphic**
   - Graphic saved to `generated-graphics/` bucket
   - Public URL returned for OBS/streaming software

### Workflow 3: Track Matches

```
POST /api/v1/matches
{
  "tournament_id": "uuid",
  "round_number": 1,
  "player1_id": "uuid",
  "player2_id": "uuid",
  "featured": true
}
```

## Database Schema

### Key Tables

**tournaments**
- Stores event information
- Tracks status (upcoming/in_progress/completed)
- Links to all decklists for that event

**players**
- Tournament participants
- External IDs from tournament software
- Metadata (country, social media, etc.)

**decklists**
- **Core coverage data**
- Links to tournament and player
- **source_type**: 'json', 'png', or 'pdf'
- Stores data in appropriate field (json_data, image_url, pdf_url)
- Tournament context (placement, record, etc.)
- Coverage metadata (featured, tags, notes)

**generated_graphics**
- Metadata for created graphics
- Links to source decklist/tournament
- Template information

## File Storage

### Supabase Storage Buckets

- `decklist-images/` - PNG screenshots (10MB max each)
- `decklist-pdfs/` - PDF exports
- `decklist-json/` - JSON files (optional)
- `generated-graphics/` - Stream overlays, graphics
- `coverage-reports/` - Final reports

### Supported Formats

**Decklist Imports:**
- JSON from tournament software
- PNG screenshots (max 10MB)
- PDF exports (max 10MB)

**Generated Graphics:**
- PNG output for stream overlays
- Customizable templates

## API Endpoints

### Tournaments
- `GET /api/v1/tournaments` - List all tournaments
- `POST /api/v1/tournaments` - Create tournament
- `GET /api/v1/tournaments/:id` - Get tournament details
- `PATCH /api/v1/tournaments/:id` - Update tournament

### Decklists
- `GET /api/v1/decklists` - List decklists (filterable)
- `GET /api/v1/decklists?tournament_id={id}` - Tournament decklists
- `POST /api/v1/decklists` - Create decklist entry
- `PATCH /api/v1/decklists/:id` - Update (tag, notes, etc.)

### Import
- `POST /api/v1/import/json` - Import JSON tournament data
- `POST /api/v1/import/file` - Upload PNG/PDF decklist

### Graphics
- `POST /api/v1/graphics/generate` - Generate graphic
- `GET /api/v1/graphics` - List generated graphics
- `GET /api/v1/graphics/:id` - Get graphic details

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

## Free Tier Limits

**Supabase Free Tier:**
- Database: 500MB storage
- File Storage: 1GB storage
- Bandwidth: 5GB/month
- API Requests: Unlimited (with rate limiting)

**Best Practices:**
- Compress PNG files before upload
- Use PDF compression
- Archive old tournaments to save space
- Monitor usage in Supabase Dashboard

## Deployment

Deploy to any of these free platforms:
- **Vercel** - Serverless (recommended for Node.js)
- **Railway** - Container deployment
- **Render** - Free tier available
- **Fly.io** - Free tier available

All use the same Supabase backend.

## Contributing

This is a specialized tool for coverage teams. Contributions should focus on:
- Import parsers for tournament software formats
- Graphics templates for different TCG types
- Coverage workflow improvements
- Performance optimizations for large tournaments

## Common Use Cases

### Pokemon TCG Coverage
- Import from Limitless TCG (JSON)
- Import from RK9 Labs (JSON/PDF)
- Import from Play! Pokemon (screenshots)

### Magic: The Gathering Coverage
- Import from Melee.gg (JSON)
- Import from WotC tools (PDF)
- Manual entry with PNG screenshots

### Other TCGs
- Generic JSON import
- PDF/PNG screenshot support
- Custom archetype tagging

## Support

For issues, feature requests, or questions, use the GitHub issue tracker.

## License

MIT
