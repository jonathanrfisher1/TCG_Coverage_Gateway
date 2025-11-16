# TCG Coverage Gateway

## Project Overview

This is the TCG Coverage Gateway project - a system designed to manage and track Trading Card Game (TCG) coverage data. The gateway serves as a central point for handling TCG-related information, inventory tracking, or data aggregation.

## Project Context

**Repository**: jonathanrfisher1/TCG_Coverage_Gateway
**Status**: Greenfield project
**Purpose**: Trading Card Game coverage gateway and data management system

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

- **Backend**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL for structured TCG data
  - Card information
  - Coverage metrics
  - User data
  - Decklist metadata
- **File Storage**:
  - PNG files: Decklist images, card scans
  - PDF files: Tournament reports, coverage documents
- **API Layer**: RESTful endpoints for data access
- **Integration**: Potential connections to TCG data providers

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
│   │   │   ├── cards.js
│   │   │   ├── decklists.js
│   │   │   ├── coverage.js
│   │   │   └── upload.js
│   │   └── middleware/
│   │       ├── auth.js
│   │       ├── fileUpload.js
│   │       └── validation.js
│   ├── services/
│   │   ├── supabase.js
│   │   ├── storage.js
│   │   └── database.js
│   ├── models/
│   │   ├── Card.js
│   │   ├── Decklist.js
│   │   └── CoverageEvent.js
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

**cards**
- id (uuid, primary key)
- name (text)
- set_name (text)
- card_number (text)
- rarity (text)
- tcg_type (text) - e.g., "Pokemon", "Magic", "Yu-Gi-Oh"
- metadata (jsonb) - flexible storage for card-specific attributes
- created_at (timestamp)
- updated_at (timestamp)

**decklists**
- id (uuid, primary key)
- title (text)
- description (text)
- tcg_type (text)
- format (text) - e.g., "Standard", "Modern", "Expanded"
- user_id (uuid, foreign key)
- image_url (text) - PNG file URL from storage
- pdf_url (text) - PDF file URL from storage
- deck_data (jsonb) - card list with quantities
- created_at (timestamp)
- updated_at (timestamp)

**coverage_events**
- id (uuid, primary key)
- event_name (text)
- event_date (date)
- location (text)
- tcg_type (text)
- description (text)
- report_pdf_url (text) - PDF coverage report from storage
- created_at (timestamp)
- updated_at (timestamp)

**users**
- id (uuid, primary key)
- email (text, unique)
- username (text, unique)
- created_at (timestamp)
- updated_at (timestamp)

### File Storage Structure

**Supabase Storage Buckets:**
- `decklists-images/` - PNG decklist images
- `decklists-pdfs/` - PDF decklist exports
- `coverage-reports/` - PDF tournament/event reports
- `card-scans/` - PNG card images

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

- This is a greenfield project - make architectural decisions thoughtfully
- Prioritize clean, maintainable code over quick solutions
- Document design decisions and trade-offs
- Consider scalability and performance from the start
- Ask clarifying questions when requirements are ambiguous
- Suggest best practices for the chosen technology stack
- Keep security considerations in mind (API authentication, data validation, etc.)

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
