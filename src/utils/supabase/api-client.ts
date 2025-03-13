import { createServerClient } from '@supabase/ssr'
import { type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in API routes with the latest recommended approach.
 * This uses the same createServerClient as middleware for consistent session handling.
 * The client handles cookie management for authentication in API routes.
 * 
 * @param request The request object from the API route
 * @returns A configured Supabase server client for API routes
 */
export function createApiSupabaseClient(request: Request | NextRequest) {
  // Create a Supabase client using the same approach as middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieHeader = request.headers.get('cookie') || '';
          // Parse the cookie header to get the specific cookie
          const cookies = cookieHeader.split(';').map(c => c.trim());
          const cookie = cookies.find(c => c.startsWith(`${name}=`));
          if (cookie) {
            const value = cookie.split('=')[1];
            return value;
          }
          return undefined;
        },
        set() {
          // In API routes, we don't need to set cookies
          // This is handled by the Supabase client on the browser
        },
        remove() {
          // In API routes, we don't need to remove cookies
          // This is handled by the Supabase client on the browser
        },
      },
    }
  );
  
  return supabase;
} 