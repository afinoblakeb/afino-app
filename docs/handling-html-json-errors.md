# Handling HTML/JSON Errors in API Responses

This guide explains how to handle the common error:

```
Error: Authentication required - received HTML instead of JSON
    at fetchUserProfile (http://localhost:3000/_next/static/chunks/src_133eacee._.js:2979:19)
```

## Understanding the Issue

This error occurs when an API endpoint returns HTML content (typically a login page or error page) instead of the expected JSON response. This commonly happens when:

1. The user's session has expired
2. The authentication token is invalid
3. The middleware redirects unauthenticated requests to the login page
4. The server returns an error page instead of a proper JSON error response

## Our Solution

We've implemented a graceful fallback approach that:

1. Detects HTML responses in API calls
2. Returns empty data instead of throwing errors
3. Logs detailed information for debugging
4. Allows the application to continue functioning

## Implementation Details

### 1. API Data Fetching Hooks

We've updated the data fetching hooks (`useUserProfile` and `useOrganizations`) to:

- Check response content type
- Detect HTML content in responses
- Return empty data instead of throwing errors
- Log detailed information about the response

### 2. Authentication Flow

The authentication flow has been simplified to:

- Use the current origin for redirect URLs
- Ensure consistent handling of callback URLs
- Properly handle the authentication code exchange

### 3. Environment Variables

Make sure your `.env.local` file includes:

```
# Site URL for local development (without trailing slash)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Debugging Tips

If you encounter HTML/JSON errors:

1. Check your browser console for logs with these prefixes:
   - `[useUserProfile]`
   - `[useOrganizations]`
   - `[SignInForm]`
   - `[Auth Callback]`
   - `[Supabase Client]`

2. Look for these specific messages:
   - "Received HTML response instead of JSON"
   - "Returning empty profile/array due to HTML response"

3. Verify your authentication state:
   - Check if you're logged in
   - Look for authentication cookies
   - Check localStorage for Supabase tokens

## Common Scenarios

### 1. Dashboard Shows Empty Data

If you see empty data on the dashboard after login, it might be because:

- The API returned HTML instead of JSON
- The hooks returned empty data instead of throwing errors
- The UI is showing the empty state

**Solution:** Try refreshing the page or logging out and back in.

### 2. Redirect Loop During Login

If you experience a redirect loop during login:

- Clear browser cookies and localStorage
- Try using an incognito/private browsing window
- Check the Supabase configuration in the dashboard

### 3. API Endpoints Return HTML

If API endpoints consistently return HTML:

- Check your middleware configuration
- Verify that your authentication token is valid
- Ensure your Supabase configuration is correct

## Supabase Configuration

Ensure your Supabase project has:

1. The correct site URL: `http://localhost:3000` for local development
2. The correct redirect URL: `http://localhost:3000/auth/callback`
3. Both local and production URLs whitelisted if needed

## Need More Help?

If you continue to experience issues:

1. Check the browser console for detailed logs
2. Look at the Network tab to see the actual responses
3. Verify your Supabase configuration
4. Clear browser storage and try again 