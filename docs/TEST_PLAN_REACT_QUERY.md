# Test Plan: React Query Implementation

This document outlines the test plan for verifying the React Query implementation that will fix the infinite API calls and page reloads issue.

## Test Categories

### 1. Unit Tests for Query Hooks

These tests verify that the custom hooks built with React Query work correctly in isolation.

#### `useUserProfile` Hook Tests

- **Test Setup**:
  - Mock API responses using MSW
  - Wrap test with QueryClientProvider

- **Test Cases**:
  - ✅ Returns loading state initially
  - ✅ Fetches and returns user profile data
  - ✅ Handles API error states properly
  - ✅ Caches data correctly
  - ✅ Respects staleTime configuration
  - ✅ Only refetches when needed

- **Example**:
```jsx
describe('useUserProfile', () => {
  it('fetches profile data correctly', async () => {
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createQueryClientWrapper(),
    });
    
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(expectedProfileData);
  });
});
```

#### `useOrganizations` Hook Tests

- **Test Cases**:
  - ✅ Returns loading state initially
  - ✅ Fetches and returns organizations data
  - ✅ Handles API error states properly
  - ✅ Uses correct query key with user.id
  - ✅ Only fetches when user.id is available

### 2. React Query Configuration Tests

These tests verify that the React Query client is configured correctly.

- **Test Cases**:
  - ✅ staleTime is set to 60000 (1 minute)
  - ✅ cacheTime is set to 3600000 (1 hour)
  - ✅ refetchOnWindowFocus uses proper throttling
  - ✅ Global error handler works correctly

### 3. Visibility Change Handler Tests

These tests verify that tab visibility changes don't trigger excessive API calls.

- **Test Setup**:
  - Simulate tab visibility changes
  - Monitor API call frequency

- **Test Cases**:
  - ✅ No excessive API calls when switching tabs
  - ✅ Respects debounce timing
  - ✅ Only refetches stale data on visibility change
  - ✅ Multiple rapid visibility changes only trigger one refetch

- **Example**:
```jsx
it('debounces API calls on visibility change', async () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock;
  
  render(<Component />);
  
  // Simulate tab switching (multiple quick switches)
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  });
  
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
  
  // Immediately switch again
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  });
  
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
  
  // Wait for debounce timeout
  await new Promise((r) => setTimeout(r, 1100));
  
  // Should only be called once, not multiple times
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

### 4. API Call Deduplication Tests

These tests verify that duplicate API calls are properly deduplicated.

- **Test Cases**:
  - ✅ Multiple components requesting the same data only trigger one API call
  - ✅ Parallel queries with the same key are deduplicated
  - ✅ Invalidating query cache triggers a single refetch

- **Example**:
```jsx
it('deduplicates parallel API calls', async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' }),
  });
  global.fetch = fetchMock;
  
  // Render multiple components that use the same query
  render(
    <>
      <Component1 />
      <Component2 />
      <Component3 />
    </>
  );
  
  // Should only make one network request
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
});
```

### 5. Auth State Change Tests

These tests verify that auth state changes don't cause cascading updates.

- **Test Cases**:
  - ✅ TOKEN_REFRESHED events don't trigger excessive API calls
  - ✅ USER_UPDATED events don't trigger excessive API calls
  - ✅ Relevant auth events properly update the UI
  - ✅ Auth provider filters events correctly

- **Example**:
```jsx
it('does not trigger excessive API calls on token refresh', async () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock;
  
  render(<AuthProvider><Component /></AuthProvider>);
  
  // Initial rendering should fetch data once
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  
  // Simulate token refresh event
  act(() => {
    // Trigger auth state change with TOKEN_REFRESHED
    mockSupabase.auth.onAuthStateChange.getListeners()[0]('TOKEN_REFRESHED', { 
      user: { id: '123' } 
    });
  });
  
  // Should not trigger additional API calls
  await new Promise((r) => setTimeout(r, 500));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

### 6. Integration Tests

These tests verify that the components work correctly with React Query.

- **Test Cases**:
  - ✅ MainLayout fetches data correctly
  - ✅ Profile component shows loading state and then data
  - ✅ Organizations component handles cache correctly
  - ✅ Components show proper error states

### 7. End-to-End Tests

These tests verify complete user flows.

- **Test Cases**:
  - ✅ User can navigate between pages without excessive API calls
  - ✅ Tab switching doesn't cause reloads or excessive API calls
  - ✅ Session remains valid during normal browsing patterns

## Test Implementation Plan

1. Create test utilities:
   - QueryClient wrapper for tests
   - MSW server setup for API mocking
   - Tab visibility simulation helpers

2. Implement tests in the following order:
   - Core React Query hook tests
   - Component-specific tests
   - Integration tests
   - End-to-end tests

3. Ensure all tests fail initially (red phase):
   - Write tests before implementing the actual fix
   - Verify they fail for the expected reasons

4. Implement the fixes incrementally:
   - Fix one component/issue at a time
   - Run tests after each change
   - Refactor as needed while maintaining passing tests

## Test Coverage Goals

- **Unit Tests**: 90% coverage for React Query hooks
- **Integration Tests**: Cover all critical components
- **End-to-End Tests**: Cover main user flows affected by the issue

## Test Running Instructions

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific tests
npm run test -- -t "useUserProfile"
``` 