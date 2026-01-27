-- QUICK FIX: Give karpenet@me.com full access to all items
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Drop all existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Users can view items" ON items;
DROP POLICY IF EXISTS "Users can insert items" ON items;
DROP POLICY IF EXISTS "Users can update items" ON items;
DROP POLICY IF EXISTS "Users can delete items" ON items;

-- Step 2: Create simple policies that allow authenticated users full access
-- Since karpenet is the only user, this gives her full access to everything

CREATE POLICY "Allow full access to authenticated users"
ON items FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Step 3: Verify RLS is enabled but with permissive policy
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Done! karpenet now has full access to all 300+ items
