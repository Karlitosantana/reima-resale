import { createClient } from '@supabase/supabase-js';

// Use environment variables for production, fallback to hardcoded for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzwxhwitpislsmfcboan.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hod2l0cGlzbHNtZmNib2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDg3ODcsImV4cCI6MjA4MDE4NDc4N30.8Xzoujo_FUOPZBCta65-iAQY9Iv02RQ8WEd5qvCjGCw';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseKey;
