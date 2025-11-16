# TCG Coverage Gateway

## Project Overview

The TCG Coverage Gateway is a specialized toolset for **tournament coverage teams**. This platform helps coverage teams manage tournament data, import and organize player decklists from various sources (JSON, PNG, PDF), generate graphics for streaming overlays, and streamline coverage workflows.

**This is NOT a deck-building or card management platform.** All decklist data is imported second-hand from tournament software after players have already submitted their lists.

## Project Context

**Repository**: jonathanrfisher1/TCG_Coverage_Gateway
**Status**: Greenfield project
**Purpose**: Tournament coverage team tools and workflow automation
**Target Users**: Coverage teams, tournament organizers, streaming producers
**Key Use Case**: Import decklist data from tournament software, organize it, and generate graphics/reports for live coverage

## Architecture & Technology Stack

### Free Tier Services Stack

**Primary Recommendation: Supabase (All-in-One)**
- **Database**: PostgreSQL (500MB free tier)
- **File Storage**: Supabase Storage (1GB free tier)
  - Store PNG decklists
  - Store PDF coverage documents
  - Built-in CDN for file delivery
- **Authentication**: Built-in auth system
- **API**: Auto-generated REST API from database schema
- **Real-time**: WebSocket support for live updates

**Alternative Services (Mix-and-Match)**
- Database: Neon PostgreSQL (3GB free) or PlanetScale MySQL (5GB free)
- File Storage: Cloudinary (25GB storage + 25GB bandwidth free)

### Application Components

- **Backend**: Node.js/Express API server
- **Database**: PostgreSQL for coverage workflow data
  - Tournaments and events
  - Players (tournament participants)
  - Imported decklists (JSON/PNG/PDF from tournament software)
  - Generated graphics metadata
  - Match tracking (optional)
  - Coverage team users
- **File Storage**: Supabase Storage for coverage assets
  - PNG files: Decklist screenshots from tournament software
  - PDF files: Decklist exports, coverage reports
  - JSON files: Raw tournament data imports
  - Generated graphics: Stream overlays, social media graphics
- **API Layer**: RESTful endpoints for coverage team workflows
- **Integration**: Import from tournament systems (Limitless, Play! Pokemon, RK9 Labs, etc.)

## Development Guidelines

### Code Quality

- Follow consistent code formatting and style guidelines
- Write clear, descriptive commit messages
- Include unit tests for new functionality
- Document API endpoints and data models
- Use meaningful variable and function names

### Git Workflow

- Main development branch: `claude/create-claude-md-015en8KukistvJbu9DePHpde`
- Create feature branches from the main development branch
- Write descriptive commit messages that explain the "why" behind changes
- Keep commits focused and atomic

### Testing

- Write tests for all new features and bug fixes
- Ensure tests pass before committing
- Include integration tests for API endpoints
- Test edge cases and error handling

## Common Tasks

### Starting Development

1. Install dependencies (command TBD based on stack)
2. Set up environment variables
3. Initialize database (if applicable)
4. Run development server

### Running Tests

Commands will be added as the testing framework is established.

### Deployment

Deployment procedures will be documented as the project infrastructure is set up.

## Project Structure

```
TCG_Coverage_Gateway/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── tournaments.js
│   │   │   ├── decklists.js
│   │   │   ├── players.js
│   │   │   ├── graphics.js
│   │   │   └── import.js
│   │   └── middleware/
│   │       ├── auth.js
│   │       ├── fileUpload.js
│   │       └── validation.js
│   ├── services/
│   │   ├── supabase.js
│   │   ├── storage.js
│   │   └── database.js
│   ├── models/
│   │   ├── Tournament.js
│   │   ├── Decklist.js
│   │   ├── Player.js
│   │   └── Graphic.js
│   └── utils/
│       ├── fileValidation.js
│       └── errorHandler.js
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   └── api/
├── config/
│   ├── database.js
│   └── storage.js
├── migrations/
│   └── sql/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── claude.md
```

## Environment Setup

### Prerequisites

**Required:**
- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Git
- Supabase account (free tier)

**Development Tools:**
- Code editor (VS Code recommended)
- Postman or similar API testing tool
- PostgreSQL client (optional, for local development)

### Environment Variables

**Supabase Configuration:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-side only)
```

**Application Configuration:**
```
PORT=3000
NODE_ENV=development
API_VERSION=v1
MAX_FILE_SIZE=10485760  # 10MB for PNG/PDF uploads
ALLOWED_FILE_TYPES=image/png,application/pdf
```

**Optional (if using alternative services):**
```
# Neon/PlanetScale Database
DATABASE_URL=postgresql://user:password@host/database

# Cloudinary (if used instead of Supabase Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## API Documentation

API endpoints and their usage will be documented as they are developed.

## Database Schema

### Core Tables (PostgreSQL)

**tournaments**
- id (uuid, primary key)
- name (text) - Tournament name
- tcg_type (text) - "Pokemon", "Magic", "Yu-Gi-Oh", etc.
- format (text) - "Standard", "Modern", "Expanded", etc.
- start_date (date), end_date (date)
- location (text), event_type (text), player_count (integer)
- status (text) - "upcoming", "in_progress", "completed"
- metadata (jsonb) - Flexible event data

**players**
- id (uuid, primary key)
- name (text) - Player name
- country (text)
- player_id_external (text) - External ID from tournament software
- metadata (jsonb) - Social media, pronouns, etc.

**decklists** - Core coverage data
- id (uuid, primary key)
- tournament_id (uuid), player_id (uuid)
- deck_name (text) - e.g., "Charizard ex", archetype (text)
- **source_type (text)** - **'json', 'png', or 'pdf'**
- **json_data (jsonb)** - Raw JSON from tournament software
- **image_url (text)** - PNG screenshot URL
- **pdf_url (text)** - PDF export URL
- placement (integer), record (text), day_2_qualified (boolean)
- featured (boolean), notes (text), tags (text array)

**generated_graphics**
- id (uuid, primary key)
- tournament_id (uuid), decklist_id (uuid)
- graphic_type (text) - 'overlay', 'standings', 'deck_profile'
- image_url (text) - Generated graphic URL
- template_used (text), metadata (jsonb)
- created_by (uuid) - Coverage user who created it

**coverage_users**
- id (uuid, primary key)
- email (text), username (text)
- role (text) - 'admin', 'coverage_team', 'viewer'

**matches** (optional)
- id, tournament_id, round_number, table_number
- player1_id, player2_id, player1_decklist_id, player2_decklist_id
- result, winner_id, featured (boolean), video_url, notes

### File Storage Structure

**Supabase Storage Buckets:**
- `decklist-images/` - PNG screenshots from tournament software
- `decklist-pdfs/` - PDF exports from tournament software
- `decklist-json/` - JSON files (optional, can use JSONB column)
- `generated-graphics/` - Graphics created for streaming/social media
- `coverage-reports/` - Final coverage documents/reports

## Troubleshooting

Common issues and their solutions will be added as they are encountered during development.

## Contributing

Guidelines for contributing to this project:

1. Follow the established code style
2. Write comprehensive tests
3. Update documentation for new features
4. Review your changes before committing
5. Ensure all tests pass

## Resources

- Project repository: jonathanrfisher1/TCG_Coverage_Gateway
- Related documentation links will be added here

## Notes for Claude

When working on this project:

- **This is a coverage team tool, NOT a deck-building platform**
- All decklist data is imported second-hand from tournament software
- No individual card management or deck creation features needed
- Focus on data import (JSON/PNG/PDF), organization, and graphics generation
- Prioritize coverage team workflow efficiency
- Consider scalability for large tournaments (500+ players)
- Keep security in mind (API authentication for coverage team only)
- Ask clarifying questions when coverage workflows are ambiguous

## Updates Needed

As development progresses, this file should be updated with:

- [x] Final technology stack details (Supabase + Node.js)
- [x] Project structure and directory organization
- [x] Database schema and models (initial design)
- [x] Environment variables and configuration
- [ ] Build and deployment commands
- [ ] API endpoint documentation
- [ ] Testing framework and commands
- [ ] CI/CD pipeline details

## Free Tier Limits & Monitoring

**Supabase Free Tier:**
- Database: 500MB (monitor with Supabase dashboard)
- Storage: 1GB for files (track PNG/PDF usage)
- Bandwidth: 5GB/month
- API requests: Unlimited (with rate limiting)

**Best Practices:**
- Optimize PNG file sizes before upload
- Use PDF compression for coverage reports
- Implement pagination for large datasets
- Monitor storage usage monthly
- Set up alerts when approaching limits
