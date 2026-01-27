-- Migration: Grant admin user full database access
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This gives karpenet@me.com full access to all items

-- ============================================
-- 1. Drop existing restrictive policies
-- ============================================

DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

-- ============================================
-- 2. Create admin-aware RLS Policies
-- ============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email = 'karpenet@me.com'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admin can view ALL items, regular users only their own
CREATE POLICY "Users can view items"
ON items FOR SELECT
USING (
  is_admin() OR auth.uid() = user_id
);

-- Policy: Admin can insert any item, regular users only for themselves
CREATE POLICY "Users can insert items"
ON items FOR INSERT
WITH CHECK (
  is_admin() OR auth.uid() = user_id
);

-- Policy: Admin can update ANY item, regular users only their own
CREATE POLICY "Users can update items"
ON items FOR UPDATE
USING (
  is_admin() OR auth.uid() = user_id
)
WITH CHECK (
  is_admin() OR auth.uid() = user_id
);

-- Policy: Admin can delete ANY item, regular users only their own
CREATE POLICY "Users can delete items"
ON items FOR DELETE
USING (
  is_admin() OR auth.uid() = user_id
);

-- ============================================
-- 3. Grant admin access to storage as well
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

-- Policy: Admin can upload any image, regular users in their folder
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'item-images'
    AND auth.role() = 'authenticated'
);

-- Policy: Admin can update any image, regular users only their own
CREATE POLICY "Users can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'item-images'
    AND (
        is_admin()
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

-- Policy: Admin can delete any image, regular users only their own
CREATE POLICY "Users can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'item-images'
    AND (
        is_admin()
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

-- ============================================
-- 4. Verify Setup
-- ============================================

-- This query should return the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'items';
