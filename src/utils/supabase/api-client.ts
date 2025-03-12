import { createServerClient } from '@supabase/ssr'
import { type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in API routes with the latest recommended approach
 * This now uses the same createServerClient as middleware for consistent session handling
 * @param request The request object from the API route
 */
export function createApiSupabaseClient(request: Request | NextRequest) {
  console.log('[API Client] Creating Supabase API client');
  
  // Check for missing environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('[API Client] Error: NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[API Client] Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }
  
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
            console.log(`[API Client] Found cookie: ${name}`);
            return value;
          }
          return undefined;
        },
        set() {
          // In API routes, we don't need to set cookies
          // This is handled by the Supabase client on the browser
          console.log('[API Client] set() called but ignored in API routes');
        },
        remove() {
          // In API routes, we don't need to remove cookies
          // This is handled by the Supabase client on the browser
          console.log('[API Client] remove() called but ignored in API routes');
        },
      },
    }
  );
  
  console.log('[API Client] Supabase API client created successfully');
  return supabase;
} 