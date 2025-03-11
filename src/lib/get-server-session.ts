import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getServerSession() {
  const cookieStore = cookies()
  
  const supabase = createClient(
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
  );
  
  const { data } = await supabase.auth.getSession();
  return data.session;
} 