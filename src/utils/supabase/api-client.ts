import { createClient } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in API routes with the latest recommended approach
 * @param request The request object from the API route
 */
export function createApiSupabaseClient(request: Request | NextRequest) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    }
  )
} 