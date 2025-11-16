# Public Sharing Feature Documentation

## Overview

The TCG Coverage Gateway supports **optional public sharing** of coverage resources. This allows coverage teams to share graphics, tournament data, and decklists with viewers without requiring them to export and re-upload elsewhere.

## Current Status

**Phase 1 (Current)**: Infrastructure Ready
- Storage buckets configured as public
- Database schema includes `is_public` flags
- Migration 003 adds sharing capabilities
- **Not yet funded** - limited to free tier bandwidth

**Phase 2 (When Funded)**: Full Public Sharing
- Public-facing pages for graphics and tournaments
- Shareable URL slugs
- View tracking
- Bandwidth sufficient for viral content

## Architecture

### Storage Configuration

All Supabase Storage buckets are configured with `public: true`:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('decklist-images', 'decklist-images', true),
    ('generated-graphics', 'generated-graphics', true),
    ...
```

This means every file gets a public URL automatically:
```
https://[project].supabase.co/storage/v1/object/public/generated-graphics/tournament-123/deck-profile.png
```

### Database Schema

Resources have public sharing controls:

**generated_graphics table**:
- `is_public` (boolean) - Toggle public visibility
- `share_slug` (text) - Human-readable URL slug
- `view_count` (integer) - Track public views

**tournaments table**:
- `is_public` (boolean) - Enable public tournament page
- `share_slug` (text) - URL slug for sharing

**decklists table**:
- `is_public` (boolean) - Include in public deck database

### Row Level Security (RLS)

Public RLS policies allow unauthenticated access to shared resources:

```sql
CREATE POLICY "Public can view shared graphics" ON generated_graphics
    FOR SELECT USING (is_public = true);
```

Coverage teams (authenticated) can manage all resources. Public users can only view resources marked `is_public = true`.

## Bandwidth Considerations

### Free Tier (5GB/month)

**Suitable for**:
- Internal coverage team use
- Direct file URLs for a few graphics
- Testing public sharing feature

**Not suitable for**:
- Viral social media graphics
- Public deck database with many users
- High-traffic tournament pages

**Example bandwidth usage**:
- 1MB graphic × 5,000 views = 5GB (reaches limit!)
- Need to be selective about what to share publicly

### Paid Tier ($25/month = 200GB)

**Suitable for**:
- Full public sharing
- Viral graphics on social media (1MB × 200,000 views)
- Public deck database
- Multiple tournaments with public pages

**When to upgrade**:
- Donations cover $25/month cost
- Bandwidth consistently approaching 5GB limit
- Want to enable public deck database feature

## Usage Workflows

### Workflow 1: Share a Graphic Publicly

1. **Generate graphic** (coverage team):
   ```bash
   POST /api/v1/graphics/generate
   {
     "type": "deck_profile",
     "decklist_id": "uuid",
     "template": "standard_overlay"
   }
   ```

2. **Toggle public and set slug**:
   ```bash
   PATCH /api/v1/graphics/{id}
   {
     "is_public": true,
     "share_slug": "charizard-nashville-2025"
   }
   ```

3. **Get shareable link**:
   ```bash
   GET /api/v1/graphics/{id}/share

   Response:
   {
     "directUrl": "https://[project].supabase.co/storage/.../graphic.png",
     "publicPageUrl": "https://tcg-coverage.com/public/graphic/charizard-nashville-2025",
     "embedCode": "<img src='...' alt='Charizard deck profile' />",
     "socialText": "Check out this Charizard ex deck from Nashville Regionals!"
   }
   ```

4. **Share on social media**:
   - Twitter: Share `publicPageUrl` with context
   - Discord: Direct image link or public page
   - Articles: Use `embedCode`

### Workflow 2: Public Tournament Page

1. **Create tournament**:
   ```bash
   POST /api/v1/tournaments
   {
     "name": "Nashville Regional Championship",
     "tcg_type": "Pokemon",
     "start_date": "2025-01-15"
   }
   ```

2. **Import decklists, add results**

3. **Make tournament public**:
   ```bash
   PATCH /api/v1/tournaments/{id}
   {
     "is_public": true,
     "share_slug": "nashville-regionals-2025"
   }
   ```

4. **Share with players and viewers**:
   ```
   https://tcg-coverage.com/public/tournament/nashville-regionals-2025
   ```

   Page shows:
   - Final standings
   - Featured decklists
   - Match results
   - VOD links

### Workflow 3: Public Deck Database

1. **Mark winning decklists as public**:
   ```bash
   PATCH /api/v1/decklists/{id}
   {
     "is_public": true
   }
   ```

2. **Viewers can browse**:
   ```
   GET /public/decks?archetype=charizard&format=standard
   ```

3. **Filter and search**:
   - By archetype
   - By tournament
   - By date range
   - By placement (e.g., top 8 only)

## View Tracking

Track how many times public resources are viewed:

```javascript
// When someone views a public graphic
POST /api/v1/public/graphic/:slug/view

// Increments view_count in database
// Returns: { views: 1523 }
```

**Dashboard shows**:
- Most viewed graphics
- Total views per tournament
- Bandwidth estimation (views × avg file size)

## Privacy Considerations

### What's Public vs Private

**Public (when is_public = true)**:
- Graphics
- Tournament results and standings
- Decklist data (deck name, archetype, placement)
- Player names (already public from tournaments)

**Always Private**:
- Coverage team notes
- Internal tags
- Draft graphics (before marking public)
- Tournament organizer metadata

### Player Privacy

- Player names are public (came from public tournaments)
- Only include data players submitted to tournaments
- Coverage teams can add metadata fields:
  - `metadata.pronouns` - If player provided
  - `metadata.social_handles` - If player shared
  - `metadata.consent_public` - Track consent for features

## Migration Path

### Phase 1: Free Tier (Current)

```bash
# Run migration 003
psql < migrations/sql/003_add_public_sharing.sql
```

- Schema supports public sharing
- Coverage teams can mark resources public
- Direct Supabase Storage URLs work
- Limited by 5GB bandwidth

### Phase 2: Paid Tier (When Funded)

1. Upgrade Supabase to Pro ($25/month)
2. Build public-facing pages:
   - `/public/graphic/:slug`
   - `/public/tournament/:slug`
   - `/public/decks`
3. Add view tracking
4. Implement share link generator
5. Create bandwidth monitoring dashboard

## Cost Breakdown

### Free Tier
- **Cost**: $0/month
- **Bandwidth**: 5GB
- **Best for**: Internal use + limited sharing

### Pro Tier
- **Cost**: $25/month (from donations)
- **Bandwidth**: 200GB
- **Best for**: Full public sharing

**Break-even calculation**:
- Need ~$30/month in donations to cover:
  - $25 Supabase Pro
  - $5 buffer for overage/other costs

## Implementation Checklist

- [x] Database schema (migration 003)
- [x] Storage buckets configured as public
- [x] RLS policies for public access
- [ ] Public graphic page frontend
- [ ] Public tournament page frontend
- [ ] Share link generator API
- [ ] View tracking endpoint
- [ ] Bandwidth monitoring dashboard
- [ ] Embed code generator
- [ ] Social media preview optimization (og:image tags)

## Future Enhancements

### Short URLs
- Use service like bit.ly or custom domain
- `tcgcoverage.gg/g/abc123` → full graphic URL

### CDN Optimization
- Aggressive caching for public resources
- Reduce bandwidth consumption
- Faster load times globally

### Analytics
- Track which graphics perform best
- Geographic distribution of viewers
- Referrer tracking (Twitter, Discord, etc.)

### Watermarking
- Optional watermark for public graphics
- Credit coverage team
- Include QR code to full tournament page
