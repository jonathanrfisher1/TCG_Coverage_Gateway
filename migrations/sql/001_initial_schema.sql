-- TCG Coverage Gateway Initial Schema
-- Purpose: Tools for tournament coverage teams
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Coverage team users (people using this tool)
-- Note: Can also use Supabase Auth directly instead
CREATE TABLE IF NOT EXISTS coverage_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'coverage_team', -- 'admin', 'coverage_team', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments/Events being covered
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tcg_type TEXT NOT NULL, -- 'Pokemon', 'Magic', 'Yu-Gi-Oh', etc.
    format TEXT, -- 'Standard', 'Modern', 'Expanded', etc.
    start_date DATE NOT NULL,
    end_date DATE,
    location TEXT,
    event_type TEXT, -- 'Regional', 'International', 'Local', etc.
    player_count INTEGER,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed'
    metadata JSONB DEFAULT '{}', -- Flexible storage for event-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_tcg_type ON tournaments(tcg_type);

-- Players (tournament participants)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT,
    player_id_external TEXT, -- External ID from tournament software (Play! Pokemon ID, DCI, etc.)
    metadata JSONB DEFAULT '{}', -- Social media handles, pronouns, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_external_id ON players(player_id_external);

-- Decklists (imported from tournament systems)
-- This is the core data for coverage teams
CREATE TABLE IF NOT EXISTS decklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,

    -- Deck identification
    deck_name TEXT, -- e.g., "Charizard ex", "Esper Control"
    archetype TEXT, -- Standardized archetype name

    -- Source data (imported second-hand)
    source_type TEXT NOT NULL, -- 'json', 'png', 'pdf'
    json_data JSONB, -- Raw JSON from tournament software
    image_url TEXT, -- PNG screenshot URL from storage
    pdf_url TEXT, -- PDF export URL from storage

    -- Tournament context
    placement INTEGER, -- Final standing/placement
    record TEXT, -- e.g., "7-2", "5-0-2"
    day_2_qualified BOOLEAN DEFAULT false,

    -- Coverage metadata
    featured BOOLEAN DEFAULT false, -- Featured on stream
    notes TEXT, -- Coverage team notes
    tags TEXT[], -- ['featured', 'rogue', 'top8', etc.]

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decklists_tournament ON decklists(tournament_id);
CREATE INDEX IF NOT EXISTS idx_decklists_player ON decklists(player_id);
CREATE INDEX IF NOT EXISTS idx_decklists_archetype ON decklists(archetype);
CREATE INDEX IF NOT EXISTS idx_decklists_placement ON decklists(placement);
CREATE INDEX IF NOT EXISTS idx_decklists_featured ON decklists(featured);

-- Generated graphics (for streaming overlays, social media, etc.)
CREATE TABLE IF NOT EXISTS generated_graphics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    decklist_id UUID REFERENCES decklists(id) ON DELETE SET NULL,

    graphic_type TEXT NOT NULL, -- 'overlay', 'standings', 'deck_profile', 'matchup', etc.
    title TEXT,
    image_url TEXT NOT NULL, -- Generated graphic URL from storage
    template_used TEXT, -- Template name/ID used for generation

    metadata JSONB DEFAULT '{}', -- Generation parameters, dimensions, etc.
    created_by UUID REFERENCES coverage_users(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_graphics_tournament ON generated_graphics(tournament_id);
CREATE INDEX IF NOT EXISTS idx_graphics_type ON generated_graphics(graphic_type);

-- Match data (optional - for detailed coverage tracking)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    table_number INTEGER,

    player1_id UUID REFERENCES players(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES players(id) ON DELETE SET NULL,
    player1_decklist_id UUID REFERENCES decklists(id) ON DELETE SET NULL,
    player2_decklist_id UUID REFERENCES decklists(id) ON DELETE SET NULL,

    result TEXT, -- '2-0', '2-1', 'draw', etc.
    winner_id UUID REFERENCES players(id) ON DELETE SET NULL,

    featured BOOLEAN DEFAULT false, -- Featured match on stream
    video_url TEXT, -- VOD link
    notes TEXT, -- Coverage notes

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_featured ON matches(featured);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_coverage_users_updated_at BEFORE UPDATE ON coverage_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decklists_updated_at BEFORE UPDATE ON decklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_graphics_updated_at BEFORE UPDATE ON generated_graphics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE coverage_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE decklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_graphics ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coverage team workflows
-- Coverage users can read everything
CREATE POLICY "Coverage team can view all data" ON tournaments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can view all players" ON players
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can view all decklists" ON decklists
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can view all graphics" ON generated_graphics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Coverage team can manage tournament data
CREATE POLICY "Coverage team can create tournaments" ON tournaments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can update tournaments" ON tournaments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can delete tournaments" ON tournaments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Coverage team can manage decklists
CREATE POLICY "Coverage team can import decklists" ON decklists
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can update decklists" ON decklists
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can delete decklists" ON decklists
    FOR DELETE USING (auth.role() = 'authenticated');

-- Coverage team can manage players
CREATE POLICY "Coverage team can create players" ON players
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can update players" ON players
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Coverage team can manage graphics
CREATE POLICY "Coverage team can create graphics" ON generated_graphics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can update graphics" ON generated_graphics
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Coverage team can delete graphics" ON generated_graphics
    FOR DELETE USING (auth.role() = 'authenticated');
