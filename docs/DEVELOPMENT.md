# Development Guide

## Important Notice: Emergency Fix in Place

⚠️ **IMPORTANT**: This codebase currently contains an emergency fix to address infinite API calls and page reloads. Please read `docs/EMERGENCY_FIX_INFINITE_RELOADS.md` for details before making changes.

## Build Requirements

A successful build is required before committing or pushing to GitHub. This is enforced by Cursor rules in `.cursorrules.yaml`.

To ensure your changes will pass, always run:

```bash
npm run build
```

## Key Areas to Be Careful With

The following areas contain emergency fixes and should be modified with caution:

1. **Data Fetching Logic**:
   - **Files**: 
     - `src/components/layout/MainLayout.tsx`
     - `src/app/(dashboard)/profile/profile-client.tsx`
     - `src/app/(dashboard)/organizations/organizations-client.tsx`
   - Fetch calls are currently throttled using localStorage
   - Components use cached data when possible
   - Changing this logic without careful testing may reintroduce the infinite reload issue
   - Look for code with `localStorage.getItem('lastOrganizationsFetch')` and similar patterns

2. **AuthProvider**:
   - **File**: `src/providers/AuthProvider.tsx`
   - Auth state change handling is carefully managed
   - Some events (TOKEN_REFRESHED, USER_UPDATED) are ignored to prevent cascading updates
   - Visibility change handling has been disabled
   - Look for code with `if (event !== 'TOKEN_REFRESHED' && event !== 'USER_UPDATED')`

3. **MainLayout Component**:
   - **File**: `src/components/layout/MainLayout.tsx`
   - HTML structure was fixed to address nesting issues
   - Dependencies in useEffect are carefully managed to prevent infinite loops
   - Look for the key `useEffect` hook with the `fetchUserOrganizations` function

4. **HTML Structure**:
   - **Files**:
     - `src/components/layout/MainLayout.tsx`
     - `src/app/(dashboard)/profile/profile-client.tsx`
   - Several components had improperly nested DIV elements
   - Ensure proper nesting of flex containers and their children
   - Be particularly careful with closing tags and their placement

## Common Anti-Patterns to Avoid

1. **Including State Variables in Dependency Arrays When They're Updated in the Effect**:
   ```jsx
   // DON'T DO THIS:
   useEffect(() => {
     // ...
     setState(newValue);
   }, [state]); // This creates an infinite loop
   ```

2. **Using Aggressive No-Cache Settings Without Good Reason**:
   ```jsx
   // AVOID THIS:
   fetch('/api/endpoint', {
     cache: 'no-store',
     headers: {
       'Cache-Control': 'no-cache'
     }
   });
   ```

3. **Adding Visibility Change Handlers That Trigger API Calls**:
   ```jsx
   // DANGEROUS PATTERN:
   useEffect(() => {
     const handleVisibilityChange = () => {
       if (document.visibilityState === 'visible') {
         fetchData(); // This can cause cascading reloads
       }
     };
     document.addEventListener('visibilitychange', handleVisibilityChange);
     // ...
   }, []);
   ```

## Testing Your Changes

Before submitting any PR, ensure you test:

1. Navigate to key pages (dashboard, profile, organizations)
2. Switch between browser tabs/windows repeatedly
3. Open the developer console and verify no repeated API calls are occurring
4. Verify no unexpected page reloads happen when switching tabs

## Long-term Improvement Plan

We are planning to replace the emergency fixes with more robust solutions:

### 1. Move to a Data Fetching Library

We plan to adopt React Query or SWR to replace our manual caching logic:

```jsx
// Future implementation with React Query
function Component() {
  const { data, isLoading, error } = useQuery(
    'organizations', 
    fetchOrganizations,
    {
      staleTime: 60000, // Data fresh for 1 minute
      cacheTime: 3600000, // Cache for 1 hour
      refetchOnWindowFocus: true, // With built-in debouncing
      onError: (error) => toast.error(`Error: ${error.message}`)
    }
  );
  
  // Component logic with data...
}
```

Benefits:
- Automatic deduplication of requests
- Smart caching with invalidation
- Built-in revalidation strategies
- Proper handling of loading and error states
- Optimistic updates for mutations

### 2. Better State Management

For complex shared state, we'll implement a proper state management solution:

```jsx
// Example with Zustand
const useStore = create((set) => ({
  userOrganizations: [],
  setUserOrganizations: (orgs) => set({ userOrganizations: orgs }),
  
  // Actions can encapsulate API calls and state updates
  fetchOrganizations: async () => {
    const response = await fetch('/api/users/me/organizations');
    const data = await response.json();
    set({ userOrganizations: data.organizations });
  }
}));
```

### 3. API Route Optimization

Our API routes will be improved with proper caching headers:

```jsx
// Server-side API route with proper caching
export async function GET(request) {
  // ... fetch data logic
  
  // Set proper cache headers
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
    }
  });
}
```

### 4. Better Testing

We'll implement specific tests for this scenario:

```jsx
// Testing tab visibility changes
test('should not trigger excessive API calls on tab visibility change', async () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock;
  
  render(<Component />);
  
  // Simulate tab switching
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  });
  
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
  
  // Should only fetch once during initial render
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
```

Please discuss any changes that might affect the current emergency fixes with the team before proceeding. 