-- TCG Coverage Gateway Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (if not using Supabase Auth)
-- Note: If using Supabase Auth, reference auth.users instead
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    set_name TEXT,
    card_number TEXT,
    rarity TEXT,
    tcg_type TEXT NOT NULL, -- 'Pokemon', 'Magic', 'Yu-Gi-Oh', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_tcg_type ON cards(tcg_type);
CREATE INDEX IF NOT EXISTS idx_cards_set_name ON cards(set_name);

-- Decklists table
CREATE TABLE IF NOT EXISTS decklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    tcg_type TEXT NOT NULL,
    format TEXT, -- 'Standard', 'Modern', 'Expanded', etc.
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT, -- PNG file URL from storage
    pdf_url TEXT, -- PDF file URL from storage
    deck_data JSONB NOT NULL DEFAULT '[]', -- Array of {card_id, quantity}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decklists_user_id ON decklists(user_id);
CREATE INDEX IF NOT EXISTS idx_decklists_tcg_type ON decklists(tcg_type);
CREATE INDEX IF NOT EXISTS idx_decklists_format ON decklists(format);

-- Coverage Events table
CREATE TABLE IF NOT EXISTS coverage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    location TEXT,
    tcg_type TEXT NOT NULL,
    description TEXT,
    report_pdf_url TEXT, -- PDF coverage report from storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coverage_events_date ON coverage_events(event_date);
CREATE INDEX IF NOT EXISTS idx_coverage_events_tcg_type ON coverage_events(tcg_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decklists_updated_at BEFORE UPDATE ON decklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coverage_events_updated_at BEFORE UPDATE ON coverage_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic examples - adjust based on your needs)
-- Allow public read access to cards
CREATE POLICY "Cards are viewable by everyone" ON cards
    FOR SELECT USING (true);

-- Allow authenticated users to create cards
CREATE POLICY "Authenticated users can create cards" ON cards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access to coverage events
CREATE POLICY "Coverage events are viewable by everyone" ON coverage_events
    FOR SELECT USING (true);

-- Allow users to view all decklists
CREATE POLICY "Decklists are viewable by everyone" ON decklists
    FOR SELECT USING (true);

-- Allow users to manage their own decklists
CREATE POLICY "Users can create their own decklists" ON decklists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decklists" ON decklists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decklists" ON decklists
    FOR DELETE USING (auth.uid() = user_id);
