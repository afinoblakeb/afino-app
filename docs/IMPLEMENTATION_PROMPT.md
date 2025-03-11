# Implementation Prompt: Fixing Infinite API Calls and Page Reloads

## Introduction

You are tasked with implementing a permanent fix for the infinite API calls and page reloads issue in the Afino application. Before starting, please thoroughly review:

1. `docs/EMERGENCY_FIX_INFINITE_RELOADS.md` - This documents the emergency fix that's currently in place, the root causes, and the recommended long-term solutions.
2. `docs/DEVELOPMENT.md` - This provides guidance on development practices, key areas to be careful with, and the planned improvements.

These files will give you a comprehensive understanding of the problem and the desired solution approach. Use them as your primary reference while implementing the fix.

## Implementation Checklist

### Phase 1: Setup and Testing Framework
- [x] Review both documentation files completely to understand the issue
- [x] Install React Query (TanStack Query) and any other required dependencies
- [x] Create a test plan document outlining the test cases that will verify the fix
- [x] Write unit tests for the visibility change handler with proper debouncing
- [x] Write tests for checking that API calls are properly deduped
- [x] Write tests to verify auth state changes don't cause cascading updates
- [x] Ensure all tests fail initially (to confirm they're testing the right thing)

### Phase 2: Data Fetching Architecture Implementation
- [x] Create a React Query provider wrapper in `src/providers/QueryProvider.tsx`
- [x] Configure the QueryClient with appropriate defaults:
  - [x] Set staleTime to 60000 (1 minute)
  - [x] Set cacheTime to 3600000 (1 hour)
  - [x] Configure refetchOnWindowFocus with proper throttling
  - [x] Add global error handler
- [x] Create custom hooks for key data fetching operations:
  - [x] `useUserProfile` hook
  - [x] `useOrganizations` hook
- [x] Update app entry point to include the new QueryProvider

### Phase 3: Refactor MainLayout Component
- [x] Replace localStorage-based caching with React Query in MainLayout.tsx
- [x] Fix HTML structure issues in the component
- [x] Update dependency arrays to only include stable identifiers
- [x] Test the changes by switching between tabs and monitoring API calls

**BREAKPOINT 1: Ask user to manually test tab switching with the MainLayout changes**

### Phase 4: Update Profile Client Component
- [x] Replace localStorage-based caching with React Query in profile-client.tsx
- [x] Implement proper loading states using React Query's isLoading flag
- [x] Fix HTML structure issues in the component
- [x] Remove visibility change handler and rely on React Query's refetchOnWindowFocus
- [x] Test the profile page functionality with tab switching

**BREAKPOINT 2: Ask user to manually test profile page with tab switching**

### Phase 5: Update Organizations Client Component
- [x] Replace localStorage-based caching with React Query in organizations-client.tsx
- [x] Fix dependency arrays in useEffect hooks
- [x] Add proper error handling using React Query's error state
- [x] Test the organizations page functionality with tab switching

**BREAKPOINT 3: Ask user to manually test organizations page with tab switching**

### Phase 6: Update AuthProvider
- [x] Refactor AuthProvider to properly filter auth events
- [x] Remove manual visibility change handler
- [x] Ensure auth state changes don't trigger unnecessary API calls
- [x] Test the auth flow to ensure it still works correctly

### Phase 7: API Optimization
- [ ] Update API routes to include proper Cache-Control headers
- [ ] Add stale-while-revalidate caching strategy
- [ ] Test API responses to verify headers are correctly set

### Phase 8: State Management Implementation
- [ ] If needed, set up Zustand for global state management
- [ ] Create stores for frequently accessed data (user profile, organizations)
- [ ] Update components to use the global state

### Phase 9: Testing and Validation
- [ ] Run all unit tests to verify they now pass
- [ ] Manually test all critical paths:
  - [ ] Sign in and sign out
  - [ ] Navigate between pages
  - [ ] Switch browser tabs repeatedly
  - [ ] Check browser console for API call patterns
- [ ] Verify no infinite loops or excessive API calls occur
- [ ] Check server logs to ensure reduced API load

**BREAKPOINT 4: Ask user to perform complete end-to-end testing of the application**

### Phase 10: Documentation and Cleanup
- [x] Remove emergency fix code and localStorage-based caching
- [ ] Update code comments to explain the new architecture
- [x] Add inline documentation for the React Query implementation
- [ ] Create examples for other developers to follow when adding new queries
- [ ] Update EMERGENCY_FIX_INFINITE_RELOADS.md to mark it as resolved
- [ ] Delete temporary files if any were created
- [x] Update PROGRESS.md to reflect the completed implementation
- [x] Create REFACTORING_PLAN.md with detailed steps for component refactoring

## Requirements and Guidelines

1. **ALWAYS follow Cursor rules defined in `.cursorrules.yaml`**, particularly:
   - All commits must pass a successful build
   - Code must conform to project linting rules
   - Tests must pass before pushing

2. **Follow React Query best practices:**
   - Use query keys consistently
   - Handle loading and error states
   - Set appropriate cache and stale times

3. **Avoid common anti-patterns:**
   - Don't include state variables updated within an effect in that effect's dependency array
   - Don't add unnecessary visibility change event handlers
   - Don't use aggressive no-cache settings without good reason

4. **Ensure backward compatibility:**
   - The fix should not break existing functionality
   - Users should not experience disruption during deployment

5. **Performance consideration:**
   - Monitor bundle size impact when adding new libraries
   - Ensure the solution improves, not degrades, performance

## Success Criteria

The implementation will be considered successful when:

1. All tests pass
2. Manual testing confirms no infinite reload issues
3. API calls are properly cached and deduplicated
4. Tab switching does not trigger excessive refreshes
5. The build passes and can be deployed
6. The codebase is cleaner and more maintainable

Remember, this fix addresses a critical production issue. Take care to ensure that your implementation is robust, well-tested, and doesn't introduce new problems. 