-- Add public sharing capabilities for coverage resources
-- Run this migration after 001 and 002

-- Add public visibility flags to generated graphics
ALTER TABLE generated_graphics
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE, -- Human-readable URL slug
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0; -- Track public views

-- Create index for public graphics lookups
CREATE INDEX IF NOT EXISTS idx_graphics_public ON generated_graphics(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_graphics_share_slug ON generated_graphics(share_slug) WHERE share_slug IS NOT NULL;

-- Add public visibility flag to decklists (optional - for public deck database)
ALTER TABLE decklists
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_decklists_public ON decklists(is_public) WHERE is_public = true;

-- Add public visibility flag to tournaments (optional - for public tournament pages)
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_tournaments_public ON tournaments(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_tournaments_share_slug ON tournaments(share_slug) WHERE share_slug IS NOT NULL;

-- Function to generate URL-friendly slug from title
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add RLS policy for public access to shared graphics
CREATE POLICY "Public can view shared graphics" ON generated_graphics
    FOR SELECT USING (is_public = true);

-- Add RLS policy for public access to shared tournaments
CREATE POLICY "Public can view shared tournaments" ON tournaments
    FOR SELECT USING (is_public = true);

-- Add RLS policy for public access to shared decklists
CREATE POLICY "Public can view shared decklists" ON decklists
    FOR SELECT USING (is_public = true);

-- Create a view for public graphics with full context
CREATE OR REPLACE VIEW public_graphics AS
SELECT
    g.id,
    g.graphic_type,
    g.title,
    g.image_url,
    g.share_slug,
    g.view_count,
    g.created_at,
    t.name as tournament_name,
    t.tcg_type,
    t.share_slug as tournament_slug,
    d.deck_name,
    d.archetype,
    p.name as player_name,
    p.country as player_country
FROM generated_graphics g
LEFT JOIN tournaments t ON g.tournament_id = t.id
LEFT JOIN decklists d ON g.decklist_id = d.id
LEFT JOIN players p ON d.player_id = p.id
WHERE g.is_public = true;

-- Grant public read access to the view
-- Note: This assumes you're using Supabase's automatic role management
GRANT SELECT ON public_graphics TO anon;
GRANT SELECT ON public_graphics TO authenticated;

-- Comments for documentation
COMMENT ON COLUMN generated_graphics.is_public IS 'When true, this graphic can be accessed via public share links';
COMMENT ON COLUMN generated_graphics.share_slug IS 'Human-readable URL slug for sharing, e.g., "charizard-deck-profile-2025"';
COMMENT ON COLUMN generated_graphics.view_count IS 'Number of times this graphic has been viewed publicly';
COMMENT ON COLUMN tournaments.share_slug IS 'URL slug for public tournament pages, e.g., "nashville-regionals-2025"';
