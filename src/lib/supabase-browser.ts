// This file is being deprecated - we're using src/utils/supabase/client.ts instead
// Keeping this for backward compatibility but ensuring it has consistent settings

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Throw detailed errors if environment variables are missing
if (!supabaseUrl) {
  throw new Error('[Supabase Browser] Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('[Supabase Browser] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

console.log('[Supabase Browser] Creating legacy browser client from supabase-browser.ts');

// Browser client with enhanced configuration
// Using same settings as our main client.ts file
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
});

console.log('[Supabase Browser] Legacy browser client created'); 