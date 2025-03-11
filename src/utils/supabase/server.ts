import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function createServerSupabaseClient() {
  // We don't need to store the cookieStore since we're not using it directly
  // The cookies are handled automatically by the fetch credentials
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: async (url, options = {}) => {
          const response = await fetch(url, {
            ...options,
            credentials: 'include',
          })

          // Set cookies from response headers in the cookie jar
          const setCookieHeader = response.headers.get('set-cookie')
          if (setCookieHeader) {
            // Parse the Set-Cookie header and set cookies
            // We can't directly set cookies from server components
            // This is just for handling the fetch response
            // The actual cookie setting will be handled by Supabase's auth system
            console.log('Set-Cookie header received:', setCookieHeader)
          }

          return response
        },
      },
    }
  )
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 