# Supabase Authentication Migration Guide

This guide explains how to update your Supabase authentication implementation to use the latest recommended patterns from Supabase.

## What's Changed

We've updated the Supabase authentication implementation to use the latest recommended patterns from Supabase. The key changes are:

1. Replaced `createServerClient` with direct `createClient` from `@supabase/supabase-js`
2. Updated cookie handling to use the new approach with `credentials: 'include'`
3. Created utility functions for different contexts (browser, server, API)
4. Improved session handling in the AuthProvider

## Files Updated

- `src/utils/supabase/server.ts` - Server-side Supabase client
- `src/utils/supabase/client.ts` - Browser-side Supabase client
- `src/utils/supabase/api-client.ts` - API route Supabase client
- `src/middleware.ts` - Middleware for authentication
- `src/lib/supabase.ts` - Legacy compatibility file
- `src/lib/get-server-session.ts` - Server session utility
- `src/providers/AuthProvider.tsx` - Auth context provider
- `src/app/api/users/me/route.ts` - Example API route update
- `src/app/auth/callback/route.ts` - Auth callback route

## How to Update Remaining API Routes

For each API route that uses Supabase authentication, update the code as follows:

### Before:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// In your API route handler
const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  }
);
```

### After:

```typescript
import { createApiSupabaseClient } from '@/utils/supabase/api-client';

// In your API route handler
const supabase = createApiSupabaseClient();
```

For API routes that receive a Request object:

```typescript
import { createApiSupabaseClient } from '@/utils/supabase/api-client';

// In your API route handler with a request parameter
export async function POST(request: Request) {
  const supabase = createApiSupabaseClient();
  // Rest of your code
}
```

## Testing Your Changes

After updating all API routes, test the following functionality:

1. Sign in/sign up flow
2. Session persistence across page refreshes
3. Protected route access
4. API calls that require authentication

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify that cookies are being set correctly
3. Ensure that the middleware is correctly handling authentication
4. Check that the AuthProvider is correctly managing the session

## References

- [Supabase Server-Side Auth Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js App Router Authentication](https://nextjs.org/docs/authentication) 