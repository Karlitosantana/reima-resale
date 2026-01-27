import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
// In production, these should be set via environment variables only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzwxhwitpislsmfcboan.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hod2l0cGlzbHNtZmNib2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDg3ODcsImV4cCI6MjA4MDE4NDc4N30.8Xzoujo_FUOPZBCta65-iAQY9Iv02RQ8WEd5qvCjGCw';

// Create Supabase client with secure configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Auto-refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL (for OAuth/magic links)
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: 'reima-resale-auth',
  },
  global: {
    headers: {
      // Add app identifier for debugging
      'x-application-name': 'reima-resale',
    },
  },
  // Retry configuration for better reliability
  db: {
    schema: 'public',
  },
});

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseKey;

// Helper to get public URL for storage files
export const getStoragePublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Secure file upload with user folder isolation
export const uploadImage = async (
  file: File,
  userId: string,
  itemId: string
): Promise<string | null> => {
  try {
    // Create unique filename with user isolation
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${itemId}/${Date.now()}.${fileExt}`;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    const { data, error } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    return getStoragePublicUrl('item-images', data.path);
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Delete image from storage
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/item-images\/(.+)/);

    if (!pathMatch) return false;

    const { error } = await supabase.storage
      .from('item-images')
      .remove([pathMatch[1]]);

    return !error;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
