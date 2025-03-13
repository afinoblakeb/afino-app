# Authentication Code Cleanup Plan

This document outlines a systematic approach to clean up authentication-related code in the Afino App codebase. The goal is to remove console logging, commented-out code, and short-term hacks to leave the codebase in a clean, maintainable state.

## Rules for Cleanup

1. DO NOT assume that any file is already reviewed.
2. DO NOT write any new code that may cause breaks. If the code looks sloppy, note it as "NEEDS REVIEW".
3. DO run `npm run build` after each file is edited to ensure no build errors.
4. DO pause any work if clarification is needed.
5. DO update this plan with [x] as the review and clean up is performed.
6. DO review similar files to understand existing coding patterns before implementing fixes. Maintain consistent patterns throughout the project.
7. DO consult before implementing any unique coding patterns that differ from established patterns in the codebase.

## Checklist

### Core Authentication Files

- [ ] `src/providers/AuthProvider.tsx` - Contains numerous console.log statements and comments
- [ ] `src/utils/supabase/middleware.ts` - Contains auth route protection logic
- [ ] `src/utils/supabase/client.ts` - Contains debug logging for localStorage operations
- [ ] `src/utils/supabase/api-client.ts` - Contains console logging for API client creation
- [ ] `src/utils/supabase/server.ts` - May contain unused code
- [ ] `src/app/logout/page.tsx` - Contains console logging for logout process
- [ ] `src/app/auth/callback/route.ts` - Handles OAuth callback

### Authentication Components

- [ ] `src/components/auth/SignInForm.tsx` - Contains extensive debug logging and commented code
- [ ] `src/components/auth/SignUpForm.tsx` - May contain unnecessary logging
- [ ] `src/components/auth/ForgotPasswordForm.tsx` - Check for consistency with other auth forms
- [ ] `src/components/auth/ResetPasswordForm.tsx` - Check for consistency with other auth forms

### Authentication Pages

- [ ] `src/app/auth/signin/page.tsx` - Check for unnecessary code
- [ ] `src/app/auth/signup/page.tsx` - Check for unnecessary code
- [ ] `src/app/auth/forgot-password/page.tsx` - Check for unnecessary code
- [ ] `src/app/auth/reset-password/page.tsx` - Check for unnecessary code
- [ ] `src/app/auth/verify/page.tsx` - Check for unnecessary code
- [ ] `src/app/auth/layout.tsx` - Check for unnecessary code

### Authentication Utilities

- [ ] `src/utils/auth/redirects.ts` - Contains extensive console logging
- [ ] `src/lib/supabase.ts` - Contains deprecated code with comments
- [ ] `src/lib/supabase-browser.ts` - Contains deprecated code with comments
- [ ] `src/lib/get-server-session.ts` - Check for unnecessary code

### API Routes with Authentication

- [ ] `src/app/api/users/me/route.ts` - Contains console logging
- [ ] `src/app/api/users/me/organizations/route.ts` - Contains console logging
- [ ] `src/app/api/user/account/route.ts` - Contains console logging
- [ ] `src/app/api/user/password/route.ts` - Check for unnecessary code
- [ ] `src/app/api/user/profile/route.ts` - Check for unnecessary code
- [ ] `src/app/api/organizations/join/route.ts` - Contains reference to deprecated `@supabase/auth-helpers-nextjs`

### Hooks with Authentication Logic

- [ ] `src/hooks/useUserProfile.ts` - Contains extensive console logging
- [ ] `src/hooks/useOrganizations.ts` - Contains extensive console logging

### Dashboard Components with Auth Dependencies

- [ ] `src/app/(dashboard)/profile/profile-client.tsx` - Contains console logging
- [ ] `src/app/(dashboard)/profile/components/account-deletion-section.tsx` - Check for auth-related code
- [ ] `src/app/(dashboard)/dashboard/page.tsx` - Contains auth-related comments
- [ ] `src/app/onboarding/onboarding-client.tsx` - Contains reference to deprecated `@supabase/auth-helpers-nextjs`

## Testing Files

- [ ] `src/providers/AuthProvider.test.tsx` - Ensure tests are up-to-date with cleaned code
- [ ] `src/components/auth/__tests__/SignInForm.test.tsx` - Ensure tests are up-to-date
- [ ] `src/components/auth/__tests__/SignUpForm.test.tsx` - Ensure tests are up-to-date
- [ ] `src/components/auth/__tests__/ForgotPasswordForm.test.tsx` - Ensure tests are up-to-date
- [ ] `src/components/auth/__tests__/ResetPasswordForm.test.tsx` - Ensure tests are up-to-date
- [ ] `src/hooks/useUserProfile.test.tsx` - Ensure tests are up-to-date
- [ ] `src/hooks/useOrganizations.test.tsx` - Ensure tests are up-to-date

## Cleanup Process

For each file in the checklist:

1. Review the file for:
   - Console.log statements
   - Commented-out code that's no longer needed
   - Redundant or duplicate code
   - Short-term hacks or workarounds
   - Inconsistent error handling
   - Outdated comments
   - References to deprecated packages (like `@supabase/auth-helpers-nextjs`)

2. Before making changes:
   - Review similar files to understand established coding patterns
   - Identify the most consistent and clean approach used elsewhere in the codebase
   - Consult before implementing any unique patterns that differ from established ones

3. Make necessary changes:
   - Remove all console.log statements
   - Remove unnecessary commented code
   - Clean up any hacks with proper implementations
   - Ensure consistent error handling
   - Update comments to reflect current code
   - Replace deprecated package references with current approaches
   - Maintain consistent coding patterns across similar files

4. Run `npm run build` to verify no build errors were introduced

5. Mark the item as completed in this checklist with [x]

## Priority Order

1. Start with core authentication files:
   - `src/providers/AuthProvider.tsx`
   - `src/utils/supabase/middleware.ts`
   - Other core files

2. Continue with components, pages, and utilities

3. Finally, update tests to match the cleaned code

## Progress Tracking

- Total files to review: 39
- Files reviewed: 0
- Files cleaned: 0
- Completion percentage: 0%

## Notes

- Pay special attention to the SignInForm.tsx which has extensive debugging code
- The AuthProvider.tsx contains many console.log statements that should be removed
- Several API routes contain debugging logs that should be cleaned up
- The hooks (useUserProfile, useOrganizations) have extensive error handling with console logs
- The `src/utils/supabase/client.ts` file contains console.log statements for localStorage operations that should be removed
- The `src/lib/supabase.ts` and `src/lib/supabase-browser.ts` files contain deprecated code that should be reviewed for potential removal
- When cleaning up files, maintain consistent patterns across similar components and utilities

## Summary and Next Steps

This plan provides a comprehensive approach to cleaning up authentication-related code in the Afino App codebase. The cleanup will be performed in a systematic manner, starting with the core authentication files.

### Immediate Next Steps:

1. Begin the systematic cleanup of the files in the checklist, starting with the core authentication files.
2. For each file, review similar files first to understand established coding patterns.
3. Maintain consistency across similar components and utilities.

### Expected Outcomes:

- A clean, maintainable codebase with no console.log statements or commented-out code
- Consistent error handling across all authentication-related files
- No references to deprecated packages
- Consistent coding patterns throughout the authentication system
- All tests passing and up-to-date with the cleaned code
- A successful build with no errors or warnings

### Tracking Progress:

As each file is reviewed and cleaned, update the checklist with [x] and increment the progress tracking numbers. This will provide a clear view of the progress being made and what remains to be done.

## Conclusion

This authentication code cleanup plan is designed to systematically address the issues in the codebase and leave it in a clean, maintainable state. By following this plan, we will:

1. Remove unnecessary console logging
2. Clean up commented-out code and short-term hacks
3. Ensure consistent error handling
4. Update deprecated package references
5. Maintain consistent coding patterns throughout the authentication system

The end result will be a more robust, maintainable authentication system that follows best practices and is free of debugging artifacts. This will make future development easier and reduce the likelihood of authentication-related bugs.

Once this plan is completed, we should consider creating a set of coding standards for authentication-related code to prevent similar issues from arising in the future. 