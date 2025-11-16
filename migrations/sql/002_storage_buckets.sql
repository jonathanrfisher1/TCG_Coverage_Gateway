-- Storage Buckets Setup
-- Run this in Supabase SQL Editor or create via Dashboard

-- Note: Storage buckets are typically created via the Supabase Dashboard
-- This file documents the required buckets and their policies

-- Required Storage Buckets:
-- 1. decklists-images (for PNG decklist images)
-- 2. decklists-pdfs (for PDF decklist exports)
-- 3. coverage-reports (for PDF tournament/event reports)
-- 4. card-scans (for PNG card images)

-- To create via SQL, you can use:
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('decklists-images', 'decklists-images', true),
    ('decklists-pdfs', 'decklists-pdfs', true),
    ('coverage-reports', 'coverage-reports', true),
    ('card-scans', 'card-scans', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow public read access to all buckets
CREATE POLICY "Public read access for decklist images"
ON storage.objects FOR SELECT
USING (bucket_id = 'decklists-images');

CREATE POLICY "Public read access for decklist PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'decklists-pdfs');

CREATE POLICY "Public read access for coverage reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'coverage-reports');

CREATE POLICY "Public read access for card scans"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-scans');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload decklist images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'decklists-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload decklist PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'decklists-pdfs'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload coverage reports"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'coverage-reports'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload card scans"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'card-scans'
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files
-- Note: You'll need to add user identification in the file path
-- For example: user_id/filename.png
CREATE POLICY "Users can delete their own decklist images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'decklists-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own decklist PDFs"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'decklists-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
