# Authentication Refactoring Plan

## Overview

This document outlines a targeted refactoring of our current Supabase authentication implementation while preserving:
- Supabase database connections
- Current environment variables
- Structure of protected routes

The goal is to implement a new authentication flow while minimizing disruption to the rest of the application.

## Progress Summary (Updated)

✅ Fixed PKCE authentication flow with OAuth providers
✅ Implemented consistent cookie handling across middleware and API routes
✅ Corrected session validation using getUser() for improved security
✅ Enhanced error handling and debugging logs throughout auth flow

**Current Status**: Authentication flow is now working correctly with both middleware and API routes properly validating sessions. API routes can now successfully retrieve user data and organizations.

## 1. Authentication Flow Components

### Core Client Utilities

**Files refactored:**
- ✅ `/src/utils/supabase/api-client.ts` - Updated to use createServerClient for consistent session handling
- ✅ `/src/utils/supabase/client.ts` - Maintained database connection, refactored auth methods
- ✅ `/src/utils/supabase/server.ts` - Maintained database connection, refactored auth methods

**Approach taken:**
- Kept Supabase client initialization for database access
- Refactored authentication methods to use createServerClient where appropriate
- Improved cookie handling for more reliable session management
- Implemented consistent session validation with getUser() instead of getSession()

### Authentication Provider

**Files refactored:**
- ✅ `/src/providers/AuthProvider.tsx` - Refactored to handle auth state changes properly

**Approach taken:**
- Kept the provider pattern and API surface (useAuth hook)
- Implemented proper auth state change listeners
- Ensured consistent session validation across the application

### Authentication Middleware

**Files refactored:**
- ✅ `/src/middleware.ts` - Significantly improved session handling

**Approach taken:**
- Kept route protection logic structure
- Refactored to use getUser() for secure session validation
- Ensured callback routes are properly excluded from middleware protection
- Added extensive logging for troubleshooting

## 2. Authentication Routes and Components

### Callback and OAuth Handling

**Files refactored:**
- ✅ `/src/app/auth/callback/route.ts` - Enhanced with better error handling and logging

**Approach taken:**
- Improved the callback route handler for proper code exchange
- Added extensive logging for debugging
- Enhanced error handling for auth failures

### Auth Forms

**Files refactored:**
- ✅ `/src/components/auth/SignInForm.tsx` - Refactored auth logic, added better error handling

**Approach taken:**
- Kept UI and form validation logic
- Refactored OAuth provider integration to follow PKCE flow best practices
- Improved error handling and debugging information

## 3. API and Data Fetching

**Files refactored:**
- ✅ `/src/hooks/useUserProfile.ts` - Updated with better error handling and content-type flexibility
- ✅ `/src/hooks/useOrganizations.ts` - Updated with better error handling and content-type flexibility
- ✅ `/src/app/api/users/me/route.ts` - Improved authentication and error handling
- ✅ `/src/app/api/users/me/organizations/route.ts` - Improved authentication and error handling

**Approach taken:**
- Updated API hooks to handle various response types gracefully
- Enhanced error reporting and logging
- Fixed JSON parsing issues with Next.js API responses
- Implemented consistent authentication verification across all API routes

## 4. Implementation Strategy - Progress

### Completed:

1. ✅ **Auth Flow Isolation**: Identified and fixed problematic auth flow components
2. ✅ **Component Updates**: Updated SignInForm with correct OAuth flow
3. ✅ **Middleware and Route Protection**: Updated middleware with improved auth validation
4. ✅ **Session Establishment**: Fixed session establishment with proper cookie handling

### In Progress:

1. 🔄 **Clean Up**: Continue removal of excessive logging and debugging code
2. 🔄 **Testing**: Continue testing different authentication scenarios

## 5. Specific Problems Addressed

1. ✅ **PKCE Flow Issues:**
   - Fixed code verifier handling with proper cookie management
   - Prevented localStorage clearing that breaks the flow
   - Simplified callback handling with better logging

2. ✅ **Session Establishment:**
   - Ensured session is properly validated with getUser() for security
   - Implemented consistent session validation across the application
   - Added better error handling for failed authentication

3. ✅ **API Route Authentication:**
   - Fixed authentication in API routes to match middleware behavior
   - Ensured consistent cookie handling in all contexts
   - Improved error handling in data fetching hooks

## 6. Remaining Items

1. 🔄 **Code Cleanup:**
   - Remove excessive logging once stability is confirmed
   - Consolidate duplicate code in Supabase client initialization
   - Remove temporary debugging code

2. 🔄 **Testing Across Environments:**
   - Verify authentication in production environment
   - Test across different browsers and devices
   - Ensure session persistence over extended periods

3. 🔄 **Documentation:**
   - Update README with current authentication approach
   - Document authentication flow for future developers

## 7. Implementation Checklist

### Setup and Configuration

- [x] Audit existing Supabase configuration in dashboard
- [x] Verify Google OAuth provider settings in Supabase
- [x] Confirm redirect URLs in Google Cloud Console match production/development URLs

### Core Authentication Components

- [x] Refactor `/src/utils/supabase/client.ts`
- [x] Refactor `/src/utils/supabase/server.ts`
- [x] Refactor `/src/utils/supabase/api-client.ts`
- [x] Refactor `/src/providers/AuthProvider.tsx`

### Auth Flow Routes

- [x] Rewrite `/src/app/auth/callback/route.ts`
- [x] Update Sign-In Implementation

### Authentication Middleware

- [x] Refactor `/src/middleware.ts`

### Session and Token Management

- [x] Implement proper cookie strategy for session storage
- [x] Add appropriate logging for debugging session issues
- [x] Test session persistence across page refreshes

### Testing and Verification

- [x] Test complete sign-in flow
  - [x] Google OAuth authentication
  - [x] Session establishment
  - [x] Redirect to protected routes
- [ ] Test sign-out flow
- [ ] Test error scenarios

### Codebase Cleanup

- [ ] Clean up authentication utility files
- [ ] Clean up authentication components
- [ ] Remove temporary debugging files

## Conclusion

The authentication system has been successfully refactored to provide a more reliable experience. The PKCE flow is now working correctly with Google OAuth, and API routes are properly authenticated. Session management has been improved with consistent cookie handling across the application.

There are still some minor cleanup tasks remaining, but the core functionality is now working as expected. 