# Supabase Authentication Flow Debugging Guide

## Overview

This document outlines the authentication flow in our Next.js application using Supabase, the issues we've encountered, and the files that need to be reviewed to implement a complete solution.

## Current Authentication Flow

1. **User initiates login**: User clicks "Sign in with Google" on the login page
2. **OAuth redirect**: Supabase redirects to Google for authentication
3. **Callback handling**: Google redirects back to our `/auth/callback` route with a code
4. **Code exchange**: The code should be exchanged for a session token
5. **Session establishment**: A session should be established in cookies
6. **Redirect to dashboard**: User should be redirected to the dashboard

## Key Issues Encountered

### 1. PKCE Code Exchange Error

Initially, we encountered this error:
```
Session exchange error: Error [AuthApiError]: invalid request: both auth code and code verifier should be non-empty
```

This occurred because we were trying to exchange the code on the server side, but the code verifier is only available on the client side as part of the PKCE (Proof Key for Code Exchange) flow.

### 2. Session Not Established Before Redirect

After fixing the PKCE issue, we encountered a timing problem:
1. User is redirected to `/auth/callback` with a code
2. The callback route immediately redirects to `/dashboard`
3. The middleware checks for a session at `/dashboard` but finds none
4. The middleware redirects to `/auth/signin`

This creates a redirect loop because the code exchange doesn't have time to complete before the redirect.

### 3. Current Error

Looking at the logs, we can see:
```
[Middleware] Path: /dashboard, Session exists: false
[Middleware] Redirecting unauthenticated user to signin page
[Middleware] Path: /auth/signin, Session exists: false
GET / 307 in 1949ms
GET /auth/signin 200 in 1004ms
[Middleware] Skipping auth check for callback route
GET /auth/callback?code=42e0e529-c5cc-4595-a577-eac12ebbe505 200 in 340ms
[Middleware] Path: /auth/signin, Session exists: false
GET /auth/signin?error=Authentication%20failed 200 in 80ms
```

This shows that:
1. The callback route is being hit with a code
2. The client-side code in the callback page is running
3. The session check is failing
4. The user is being redirected to `/auth/signin` with an error

## Solutions Attempted

### 1. Server-Side Code Exchange

Initially, we tried to exchange the code for a session on the server side in the callback route. This failed because the code verifier is only available on the client side.

### 2. Simplified Callback Route

We then simplified the callback route to just redirect to the dashboard, expecting the client-side Supabase SDK to handle the code exchange. This failed because the redirect happened before the code exchange could complete.

### 3. Client-Side Code Exchange Page

Our latest attempt was to create a client-side page in the callback route that:
- Loads the Supabase JS library
- Creates a Supabase client
- Waits for the code exchange to complete
- Checks for a session
- Only redirects to the dashboard when a session is confirmed

This approach still fails, likely because:
- The Supabase client in the callback page might not be properly configured
- The session might not be properly stored in cookies
- There might be issues with the PKCE flow configuration

## Files to Review

### 1. Authentication Flow Files

- **`src/components/auth/SignInForm.tsx`**: Initiates the OAuth flow
- **`src/app/auth/callback/route.ts`**: Handles the callback from Google
- **`src/middleware.ts`**: Controls access to protected routes
- **`src/providers/AuthProvider.tsx`**: Manages authentication state

### 2. Supabase Client Configuration Files

- **`src/utils/supabase/client.ts`**: Client-side Supabase client
- **`src/utils/supabase/server.ts`**: Server-side Supabase client
- **`src/utils/supabase/api-client.ts`**: API route Supabase client
- **`src/lib/supabase.ts`**: Legacy compatibility file

### 3. Environment Configuration

- **`.env.local`**: Contains Supabase URL and anon key

## Recommended Approach for a New Solution

1. **Review Supabase Documentation**: Thoroughly review the latest Supabase documentation on authentication with Next.js App Router, particularly focusing on the PKCE flow.

2. **Consistent Client Configuration**: Ensure all Supabase clients (client-side, server-side, API) are configured consistently with the correct options for session persistence.

3. **Proper Callback Handling**: Implement a robust callback handler that ensures the code exchange completes before any redirects.

4. **Session Verification**: Add proper session verification and debugging to identify exactly where the session is being lost.

5. **Cookie Management**: Ensure cookies are being properly set and read across the application.

## Specific Areas to Investigate

1. **Supabase Client Configuration**: Check if the Supabase client in the callback page is properly configured with the correct URL and anon key.

2. **Cookie Domain and Path**: Verify that cookies are being set with the correct domain and path.

3. **PKCE Flow Configuration**: Ensure the PKCE flow is properly configured in the SignInForm.

4. **Session Storage**: Check how the session is being stored and retrieved across the application.

5. **Middleware Behavior**: Verify that the middleware is correctly handling the session check and not interfering with the authentication flow.

## Conclusion

The authentication flow issues are complex and involve multiple components working together. A comprehensive solution requires a deep understanding of how Supabase authentication works with Next.js, particularly in the context of the App Router and server components.

The key to solving this issue is to ensure that the code exchange completes and a session is established before any redirects happen, and that the session is properly persisted and accessible across the application. 