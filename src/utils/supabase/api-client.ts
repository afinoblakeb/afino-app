import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in API routes with the latest recommended approach
 */
export function createApiSupabaseClient(request?: NextRequest) {
  // For API routes with Request objects
  if (request) {
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
  
  // For server components using the cookies() API
  const cookieStore = cookies()
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
          cookie: cookieStore.toString(),
        },
      },
    }
  )
} 