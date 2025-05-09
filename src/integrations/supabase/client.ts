
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uoovrxfpjsyvpkqdxkoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZyeGZwanN5dnBrcWR4a29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwOTQsImV4cCI6MjA2MTQxNDA5NH0.7x9xrScO6VZdmT2YlwoCXHKS7I1e0CIW58xDIgf0N1w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== 'undefined', // Only persist sessions in browser environments
    autoRefreshToken: typeof window !== 'undefined',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
});
