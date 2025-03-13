/**
 * @deprecated This file is deprecated - use src/utils/supabase/client.ts instead
 * Kept for backward compatibility but will be removed in a future version
 */

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