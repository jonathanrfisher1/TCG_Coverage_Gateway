-- Storage Buckets Setup for Coverage Team Workflows
-- Run this in Supabase SQL Editor or create via Dashboard

-- Note: Storage buckets are typically created via the Supabase Dashboard
-- This file documents the required buckets and their policies

-- Required Storage Buckets:
-- 1. decklist-images (PNG screenshots from tournament software)
-- 2. decklist-pdfs (PDF exports from tournament software)
-- 3. decklist-json (JSON files from tournament systems - optional, can use JSONB column)
-- 4. generated-graphics (Graphics created by coverage team)
-- 5. coverage-reports (Final coverage documents/reports)

-- To create via SQL, you can use:
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('decklist-images', 'decklist-images', true),
    ('decklist-pdfs', 'decklist-pdfs', true),
    ('decklist-json', 'decklist-json', true),
    ('generated-graphics', 'generated-graphics', true),
    ('coverage-reports', 'coverage-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow public read access to all buckets
CREATE POLICY "Public read access for decklist images"
ON storage.objects FOR SELECT
USING (bucket_id = 'decklist-images');

CREATE POLICY "Public read access for decklist PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'decklist-pdfs');

CREATE POLICY "Public read access for decklist JSON"
ON storage.objects FOR SELECT
USING (bucket_id = 'decklist-json');

CREATE POLICY "Public read access for generated graphics"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-graphics');

CREATE POLICY "Public read access for coverage reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'coverage-reports');

-- Allow coverage team to upload files
CREATE POLICY "Coverage team can upload decklist images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'decklist-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can upload decklist PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'decklist-pdfs'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can upload decklist JSON"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'decklist-json'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can upload generated graphics"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'generated-graphics'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can upload coverage reports"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'coverage-reports'
    AND auth.role() = 'authenticated'
);

-- Allow coverage team to delete files
CREATE POLICY "Coverage team can delete decklist images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'decklist-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can delete decklist PDFs"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'decklist-pdfs'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can delete generated graphics"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'generated-graphics'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Coverage team can delete coverage reports"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'coverage-reports'
    AND auth.role() = 'authenticated'
);
