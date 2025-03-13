/**
 * @deprecated This function is deprecated - use createClient from @/utils/supabase/server instead
 * This will be removed in a future version
 */
import { createClient } from '@supabase/supabase-js'

/**
 * Gets the current user session from the server
 * @returns The current user session or null if not authenticated
 */
export async function getServerSession() {
  // Create a Supabase client without cookies for server components
  // This will rely on the cookies being sent automatically by the browser
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: async (url, options = {}) => {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      },
    }
  );
  
  const { data } = await supabase.auth.getSession();
  return data.session;
} 