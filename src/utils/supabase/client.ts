import { createBrowserClient } from '@supabase/ssr';

export const customStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    console.log('getItem', key, globalThis.localStorage.getItem(key));
    return globalThis.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      console.log('setItem', key, value, globalThis.localStorage.setItem(key, value));
      globalThis.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      console.log('removeItem', key, globalThis.localStorage.removeItem(key));
      globalThis.localStorage.removeItem(key);
    }
  },
};

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