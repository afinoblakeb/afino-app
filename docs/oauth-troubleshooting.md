# OAuth Redirect Troubleshooting Guide

This guide helps you troubleshoot and fix common issues with OAuth redirects in the Afino app.

## Common Issues

### 1. Redirected to Production URL Instead of Local URL

**Symptoms:**
- You click "Sign in with Google" on your local development environment
- The OAuth flow starts correctly, but after authentication, you're redirected to the production URL (e.g., `https://afino-app.vercel.app/auth/callback`) instead of your local URL

**Causes:**
- Incorrect environment variables
- Supabase site URL configuration
- OAuth state parameter issues
- Redirect URL mismatch between client and server

**Solutions:**

#### Check Environment Variables

Ensure your `.env.local` file has the correct settings:

```
# Site URL for local development (without trailing slash)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Debug mode for authentication
AUTH_DEBUG=true
```

#### Verify Supabase Configuration

1. In the Supabase dashboard, go to Authentication → URL Configuration
2. Ensure your local URL is added to the "Site URL" list: `http://localhost:3000`
3. Add both local and production URLs to the "Redirect URLs" list:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`

#### Clear Browser Storage

OAuth issues can sometimes be resolved by clearing stored data:

1. Open your browser's developer tools (F12)
2. Go to Application → Storage
3. Clear:
   - Local Storage (especially items starting with `sb-` or containing `supabase`)
   - Session Storage
   - Cookies for your domain

#### Check Network Requests

1. Open browser developer tools
2. Go to the Network tab
3. Filter for "callback" or "oauth"
4. Look for:
   - The initial OAuth redirect URL (should contain your local domain)
   - The callback request (check if it's going to the correct domain)
   - Any redirect responses (look at Location headers)

## Debugging Tips

### Enable Debug Logging

We've added extensive logging to help troubleshoot OAuth issues:

1. Check your browser console for logs with prefixes like:
   - `[SignInForm]`
   - `[Auth Callback]`
   - `[Supabase Client]`
   - `[Redirects]`

2. Look for specific log messages:
   - Base URL detection
   - Redirect URL construction
   - OAuth initialization
   - Callback processing

### Test with a Fresh Browser Session

Sometimes OAuth issues are related to cached credentials or cookies:

1. Open an incognito/private browsing window
2. Try the authentication flow again
3. Check if the issue persists

## Code Modifications for Debugging

If you need to add more debugging, here are key files to modify:

1. `src/utils/auth/redirects.ts` - URL construction logic
2. `src/components/auth/SignInForm.tsx` - OAuth initialization
3. `src/app/auth/callback/route.ts` - Callback handling
4. `src/utils/supabase/client.ts` - Supabase client configuration

## Common Error Messages

### "Invalid site_url"

This error occurs when the site URL in your Supabase configuration doesn't match the URL you're using.

**Solution:** Update the site URL in Supabase dashboard to include your local development URL.

### "Invalid redirect_uri"

This happens when the redirect URL doesn't match one of the allowed redirect URLs in your OAuth provider settings.

**Solution:** Add your local callback URL (`http://localhost:3000/auth/callback`) to the allowed redirect URLs in both Supabase and your OAuth provider (Google, GitHub, etc.).

### "State mismatch"

This security error occurs when the state parameter sent during OAuth initialization doesn't match the one received in the callback.

**Solution:** This is often caused by cookies or localStorage issues. Try clearing browser storage and ensure your application is properly maintaining state during the OAuth flow.

## Need More Help?

If you're still experiencing issues after trying these solutions:

1. Collect the full console logs from your browser
2. Note the exact sequence of redirects (use Network tab)
3. Check the Supabase logs in the dashboard
4. Contact the development team with this information 