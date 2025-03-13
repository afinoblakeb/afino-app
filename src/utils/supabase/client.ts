import { createBrowserClient } from '@supabase/ssr';

/**
 * Custom storage adapter for Supabase authentication.
 * Provides methods to interact with localStorage while ensuring
 * it only runs in browser environments.
 */
export const customStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return globalThis.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      globalThis.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      globalThis.localStorage.removeItem(key);
    }
  },
};

/**
 * Creates a Supabase client for browser environments.
 * Uses PKCE (Proof Key for Code Exchange) flow for secure authentication.
 * 
 * @returns A configured Supabase browser client
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        storage: customStorageAdapter,
      },
    }
  );
}