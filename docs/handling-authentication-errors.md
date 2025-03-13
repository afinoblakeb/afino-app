# Handling Authentication Errors in the Afino App

This guide explains the changes we've made to handle authentication errors gracefully in the Afino app.

## The Problem

When a user's session expires or they're not authenticated, API requests would return HTML content (typically a login page) instead of JSON responses. This caused errors like:

```
Error: Authentication required - received HTML instead of JSON
    at fetchUserProfile (http://localhost:3000/_next/static/chunks/src_133eacee._.js:2979:19)
```

## Our Solution

We've implemented a comprehensive approach to handle authentication errors:

1. **Middleware Improvements**:
   - API routes now return proper JSON error responses instead of HTML redirects
   - Clear separation between API routes and page routes

2. **Authentication State Management**:
   - Added `isAuthenticated` flag to the AuthProvider
   - Prevent unnecessary API calls when not authenticated

3. **Graceful Error Handling**:
   - Data fetching hooks return empty data instead of throwing errors
   - Detailed logging for debugging

## Implementation Details

### 1. Middleware Updates

The middleware now detects API routes and handles them differently:

```typescript
// Handle API routes differently - return JSON responses instead of redirects
if (!user && isApiRoute(pathname)) {
  return new NextResponse(
    JSON.stringify({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    }),
    { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
```

### 2. AuthProvider Enhancements

The AuthProvider now includes an `isAuthenticated` flag:

```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);

// Update during session check
setIsAuthenticated(!!data.session);

// Update during auth state changes
if (event === 'SIGNED_OUT') {
  setIsAuthenticated(false);
} else if (event === 'SIGNED_IN') {
  setIsAuthenticated(!!currentSession);
}
```

### 3. Data Fetching Hooks

Data fetching hooks now:
- Only run when authenticated
- Return empty data instead of throwing errors
- Include detailed logging

```typescript
// Only run the query if authenticated
enabled: enabled && isAuthenticated,

// Return empty data instead of throwing errors
if (text.trim().startsWith('<!DOCTYPE')) {
  return { id: '', name: '', email: '' }; // Empty profile
}
```

### 4. Component Updates

Components like MainLayout now handle authentication state properly:

```typescript
// If not authenticated, show the children (middleware will handle redirect)
if (!isAuthenticated) {
  return <>{children}</>;
}
```

## How It Works

1. **On Initial Load**:
   - AuthProvider checks for an existing session
   - Sets `isAuthenticated` flag based on session existence
   - Components wait for authentication check before making API calls

2. **When Session Expires**:
   - API calls return 401 JSON responses instead of HTML
   - Data fetching hooks return empty data
   - UI shows appropriate empty states

3. **During Sign In/Out**:
   - AuthProvider updates `isAuthenticated` flag
   - React Query cache is cleared or invalidated as needed
   - Components re-render with the new authentication state

## Debugging Tips

If you encounter authentication issues:

1. Check the browser console for logs with these prefixes:
   - `[AuthProvider]`
   - `[Middleware]`
   - `[useUserProfile]`
   - `[useOrganizations]`

2. Look for these specific messages:
   - "Auth state changed"
   - "Session check result"
   - "Unauthenticated API request"

3. Verify your authentication state:
   - Check if `isAuthenticated` is correctly set
   - Look for authentication cookies
   - Check localStorage for Supabase tokens

## Common Scenarios

### 1. Empty Dashboard After Login

If you see an empty dashboard after login:

- Check if the API is returning proper JSON responses
- Verify that the data fetching hooks are enabled
- Look for authentication errors in the console

### 2. API Returns HTML Instead of JSON

If API endpoints still return HTML:

- Check if the middleware is correctly identifying API routes
- Verify that the Content-Type header is set correctly
- Ensure your Supabase configuration is correct

### 3. Unnecessary API Calls When Not Authenticated

If you see API calls when not authenticated:

- Check if the data fetching hooks are using the `isAuthenticated` flag
- Verify that the `enabled` option is set correctly
- Look for race conditions in the authentication flow

## Need More Help?

If you continue to experience issues:

1. Check the browser console for detailed logs
2. Look at the Network tab to see the actual responses
3. Verify your Supabase configuration
4. Clear browser storage and try again 