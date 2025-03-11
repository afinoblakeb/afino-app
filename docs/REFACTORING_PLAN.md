# React Query Refactoring Plan

This document outlines the step-by-step plan for refactoring our components to use React Query for data fetching and state management. This refactoring will address the infinite API calls and page reloads issue by implementing a proper data fetching architecture.

## Overview

We've identified several components that are causing the infinite API calls and page reloads:

1. `MainLayout` - Fetches user profile and organizations data on mount and visibility change
2. `AuthProvider` - Manages authentication state and triggers refetches
3. `profile-client.tsx` - Fetches user profile data directly
4. `organizations-client.tsx` - Fetches organizations data directly

Our approach will be to:

1. Replace direct API calls with React Query hooks
2. Centralize data fetching logic in custom hooks
3. Implement proper caching and refetching strategies
4. Add HTTP caching headers to API routes

## Prerequisites (Completed)

- [x] Set up React Query infrastructure
  - [x] Install React Query dependencies
  - [x] Create QueryProvider component
  - [x] Set up testing utilities

- [x] Create custom hooks for data fetching
  - [x] Implement useUserProfile hook
  - [x] Implement useOrganizations hook

- [x] Create tests for React Query implementation
  - [x] Test visibility change behavior
  - [x] Test integration with AuthProvider

## Refactoring Steps

### 1. Update App Entry Point

- [ ] Wrap the application with QueryProvider
  - [ ] Update `app/layout.tsx` to include QueryProvider
  - [ ] Ensure QueryProvider is positioned correctly in the provider hierarchy

### 2. Refactor MainLayout Component

- [ ] Identify all direct API calls in MainLayout
- [ ] Replace fetch calls with useUserProfile and useOrganizations hooks
- [ ] Remove manual visibility change handling
- [ ] Remove localStorage-based throttling
- [ ] Update loading states to use React Query's isLoading
- [ ] Update error handling to use React Query's error state
- [ ] Test the refactored component

### 3. Refactor AuthProvider

- [ ] Identify authentication state changes that trigger refetches
- [ ] Use React Query's queryClient.invalidateQueries to trigger refetches
- [ ] Remove manual refetching logic
- [ ] Ensure auth state changes properly invalidate relevant queries
- [ ] Test the refactored component

### 4. Refactor profile-client.tsx

- [ ] Replace direct API calls with useUserProfile hook
- [ ] Update component to handle loading and error states
- [ ] Remove any duplicate data fetching logic
- [ ] Test the refactored component

### 5. Refactor organizations-client.tsx

- [ ] Replace direct API calls with useOrganizations hook
- [ ] Update component to handle loading and error states
- [ ] Remove any duplicate data fetching logic
- [ ] Test the refactored component

### 6. Add HTTP Caching to API Routes

- [ ] Identify API routes that should implement caching
  - [ ] `/api/users/me`
  - [ ] `/api/users/me/organizations`
  - [ ] Other frequently accessed routes

- [ ] Add appropriate cache-control headers
  - [ ] Set max-age for static data
  - [ ] Use stale-while-revalidate for dynamic data
  - [ ] Implement ETag or Last-Modified headers

- [ ] Test API caching behavior

## Testing Strategy

For each refactored component:

1. Write unit tests to verify:
   - Correct data is displayed
   - Loading states are handled properly
   - Error states are handled properly
   - Refetching works as expected

2. Write integration tests to verify:
   - Components work together correctly
   - Data is shared between components
   - Authentication state changes trigger appropriate refetches

3. Manual testing to verify:
   - No infinite API calls or page reloads
   - Performance improvements
   - User experience is smooth

## Rollout Plan

1. Implement changes in a feature branch
2. Run all tests to ensure functionality
3. Deploy to staging environment
4. Perform manual testing
5. Monitor performance metrics
6. Deploy to production
7. Monitor for any regressions

## Success Criteria

- No more infinite API calls or page reloads
- Reduced number of API calls overall
- Improved application performance
- Proper loading states during data fetching
- Proper error handling
- Consistent user experience

## Fallback Plan

If issues arise during the rollout:
1. Identify the specific component causing problems
2. Revert that component to the previous implementation
3. Fix the issues in the refactored component
4. Re-deploy the fixed component

## Timeline

- Day 1: Refactor MainLayout and update App entry point
- Day 2: Refactor AuthProvider
- Day 3: Refactor profile-client and organizations-client
- Day 4: Add HTTP caching to API routes
- Day 5: Testing and bug fixes
- Day 6: Deployment and monitoring 