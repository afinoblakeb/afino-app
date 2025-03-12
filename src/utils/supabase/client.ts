import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser environments with appropriate settings
 * for reliable authentication flow
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        // Enable auto-detection of the auth code in URL for seamless code exchange
        detectSessionInUrl: true,
        // Persist the session in cookies (default)
        persistSession: true,
        // Debug mode in development
        debug: process.env.NODE_ENV === 'development',
        // Don't customize storage - let Supabase handle it properly
      },
      // Global fetch options if needed
      global: {
        fetch: undefined, // Use default fetch
      },
    }
  )
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createBrowserSupabaseClient instead
 */
export function createClient() {
  return createBrowserSupabaseClient()
} 