-- Migration: Add user authentication and Row Level Security
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- 1. Add user_id column to items table
-- ============================================

-- Check if user_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);

-- ============================================
-- 2. Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

-- ============================================
-- 3. Create RLS Policies
-- ============================================

-- Policy: Users can only SELECT their own items
CREATE POLICY "Users can view their own items"
ON items FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT items for themselves
CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own items
CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own items
CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. Storage Bucket Security (for images)
-- ============================================

-- Create storage bucket for item images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'item-images'
    AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'item-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'item-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 5. Verify Setup
-- ============================================

-- This query should return the policies we just created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'items';
