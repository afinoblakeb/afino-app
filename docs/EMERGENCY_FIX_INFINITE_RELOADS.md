# Emergency Fix: Infinite API Calls & Reloads

## Status: RESOLVED ✅

The infinite API calls and page reloads issue has been fully resolved by implementing React Query as a permanent solution. The emergency localStorage-based fix described in this document has been replaced with a proper data fetching architecture.

## Problem Description

The application was experiencing severe performance issues due to infinite API calls and page reloads. Specifically:

1. Excessive server load
2. Poor user experience
3. Potential data consistency issues
4. Difficulty navigating the application

## Root Causes

After investigation, several issues were identified:

1. **Event Cascading**: Auth state changes triggered re-renders, which triggered more API calls, which sometimes triggered more auth state changes.

2. **Improper useEffect Dependencies**: Several components had incomplete or excessive dependencies in useEffect hooks, causing unnecessary re-execution.

3. **Visibility Change Handlers**: The application was aggressively refetching data when a user returned to a tab, without proper throttling.

4. **No Caching Strategy**: API requests were being made without considering whether data had already been fetched recently.

5. **HTML Structure Issues**: Some components had improperly nested elements, potentially causing rendering issues.

## Emergency Fix Implementation

The following changes were made as an emergency fix:

1. **Throttled API Calls with localStorage**:
   - Added time-based throttling using localStorage to prevent repeated calls.
   - Example: `localStorage.getItem('lastOrganizationsFetch')` to check when data was last fetched.

2. **Cached API Responses**:
   - Stored API responses in localStorage with timestamps.
   - Used cached data when available if within a reasonable timeframe.

3. **Filtered Auth Events**:
   - Modified AuthProvider to ignore certain events (TOKEN_REFRESHED, USER_UPDATED).
   - Prevents cascade of auth state changes.

4. **Disabled Visibility Change Handlers**:
   - Removed event listeners for document visibility changes to prevent reload loops.

5. **Fixed HTML Structure**:
   - Corrected nested HTML elements to ensure proper rendering.

## Specific Files and Code Issues

### MainLayout.tsx

This component was fetching organization data on mount and had improperly configured dependencies:

```jsx
// Problematic code
useEffect(() => {
  const fetchUserOrganizations = async () => {
    // ... fetch logic
    setUserOrganizations(data.organizations);
  };
  
  fetchUserOrganizations();
}, [user, userOrganizations]); // Including userOrganizations creates loop
```

Fix implemented:
```jsx
// Fixed code with proper dependency array and throttling
useEffect(() => {
  const fetchUserOrganizations = async () => {
    // Check if we recently fetched
    const lastFetch = localStorage.getItem('lastOrganizationsFetch');
    if (lastFetch && Date.now() - parseInt(lastFetch) < 60000) {
      // Use cached data
      const cachedData = localStorage.getItem('organizationsCache');
      if (cachedData) {
        setUserOrganizations(JSON.parse(cachedData));
        return;
      }
    }
    
    // Proceed with fetch
    try {
      const res = await fetch('/api/users/me/organizations');
      const data = await res.json();
      
      // Cache the result
      localStorage.setItem('organizationsCache', JSON.stringify(data.organizations));
      localStorage.setItem('lastOrganizationsFetch', Date.now().toString());
      
      setUserOrganizations(data.organizations);
    } catch (error) {
      console.error('Failed to fetch organizations', error);
    }
  };
  
  if (user?.id) {
    fetchUserOrganizations();
  }
}, [user?.id]); // Only depend on user ID
```

### profile-client.tsx

This component was also making API calls without proper throttling and had visibility change listeners:

```jsx
// Problematic code
useEffect(() => {
  const fetchUserProfile = async () => {
    // ... fetch logic
  };
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchUserProfile();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  fetchUserProfile();
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [user]);
```

### organizations-client.tsx

Similar issues with unnecessary API calls and improper dependency management:

```jsx
// Problematic code
useEffect(() => {
  fetchOrganizations();
}, [organizations]); // This creates an infinite loop
```

### AuthProvider.tsx

The auth provider was reacting to all auth events without filtering, causing cascading updates:

```jsx
// Problematic code
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
  // This triggers every time, including for token refreshes
});
```

## Potential Risks

The emergency fix introduces some risks:

1. **Stale Data**: Users might see outdated information due to caching.
2. **localStorage Limitations**: Private browsing or incognito modes might have issues with localStorage.
3. **Manual Refresh Required**: Users might need to manually refresh to get the latest data.
4. **Inconsistent Experience**: Different browsers might handle the cache differently.

## Future Improvements

This emergency fix is a temporary solution. The following long-term improvements are planned:

### 1. Modern Data Fetching Architecture

We should adopt a dedicated data fetching library like React Query or SWR to handle:

- Automatic request deduplication
- Smart caching with automatic invalidation
- Background refreshing
- Proper loading and error states

Example implementation with React Query:

```jsx
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';

// Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 3600000, // 1 hour
      retry: 1,
      refetchOnWindowFocus: true, // With built-in debouncing
    },
  },
});

// Component implementation
function ProfileComponent() {
  const { data, isLoading, error } = useQuery(
    ['profile', user?.id], 
    () => fetchUserProfile(user.id),
    {
      enabled: !!user?.id,
      onError: (err) => console.error('Profile fetch error:', err)
    }
  );
  
  // Render with proper loading/error states
}
```

### 2. Refactored Effect Logic

Complex useEffect hooks should be:

- Split into smaller, focused effects
- Each with minimal dependencies
- Clear separation of concerns

```jsx
// Good pattern - split effects by concern
useEffect(() => {
  // Effect only for auth state
}, [user?.id]);

useEffect(() => {
  // Effect only for organization changes
}, [organizationId]);
```

### 3. Proper Visibility Change Handling

Instead of disabling visibility handlers entirely, implement proper debouncing:

```jsx
useEffect(() => {
  let timeoutId = null;
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Clear any pending timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      // Set a new timeout to prevent rapid successive calls
      timeoutId = setTimeout(() => {
        // Check if data is stale before refetching
        const lastFetchTime = localStorage.getItem('lastDataFetch');
        if (!lastFetchTime || Date.now() - parseInt(lastFetchTime) > 60000) {
          refetchData();
        }
      }, 1000); // 1 second debounce
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (timeoutId) clearTimeout(timeoutId);
  };
}, []);
```

### 4. HTTP and Backend Caching

Implement proper HTTP caching headers on the API endpoints:

```jsx
// Server-side API route
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

This allows browsers to properly cache responses and use stale-while-revalidate patterns.

### 5. State Management Optimization

For complex shared state, consider implementing a centralized state management solution like Zustand or Redux:

```jsx
// Example with Zustand
const useStore = create((set) => ({
  profile: null,
  organizations: [],
  
  setProfile: (profile) => set({ profile }),
  setOrganizations: (orgs) => set({ organizations: orgs }),
  
  // Actions with API calls
  fetchProfile: async () => {
    const response = await fetch('/api/users/me');
    const data = await response.json();
    set({ profile: data });
  }
}));
```

### 6. Code Quality Improvements

- Add comprehensive unit and integration tests
- Implement monitoring to detect potential infinite loops
- Add performance metrics for API calls
- Create a reliable development workflow with lint rules to prevent these issues

## Deployment Plan

To safely deploy this fix:

1. **Phased Rollout**: 
   - Deploy to a staging environment first
   - Then to a small percentage of production users
   - Gradually increase the rollout percentage

2. **Monitoring**:
   - Set up dashboard to track API call frequency
   - Monitor server load metrics
   - Track client-side errors
   - Set up alerts for unusual patterns

3. **Rollback Plan**:
   - Maintain the ability to instantly roll back to the previous version
   - Have database snapshots ready in case of data issues

4. **User Communication**:
   - Inform users about potential temporary data refresh needs
   - Provide clear instructions if manual refresh is needed 

## Resolution

The emergency fix has been replaced with a proper implementation of React Query. The following improvements have been made:

### 1. React Query Infrastructure

- Installed and configured React Query with optimal settings
- Set up a QueryProvider component to wrap the application
- Configured proper staleTime, cacheTime, and refetchOnWindowFocus settings
- Added testing utilities for React Query

### 2. Custom Hooks for Data Fetching

- Implemented useUserProfile hook for fetching user profile data
- Implemented useOrganizations hook for fetching organizations data
- Added proper error handling with toast notifications
- Configured caching and refetching strategies

### 3. Component Refactoring

- Refactored MainLayout to use React Query hooks
- Refactored AuthProvider to properly filter auth events and integrate with React Query
- Refactored profile-client to use React Query for data fetching
- Refactored organizations-client to use React Query for data fetching
- Removed all localStorage-based throttling and caching

### 4. Testing

- Created tests for visibility change behavior
- Created tests for the integration with AuthProvider
- Created tests for custom hooks
- Verified that React Query properly handles tab visibility changes

### Results

- Eliminated infinite API calls and page reloads
- Improved user experience with proper loading states
- Reduced server load through efficient caching
- Better error handling and user feedback
- Consistent behavior across browsers

See `docs/REFACTORING_PLAN.md` for the detailed plan and `docs/IMPLEMENTATION_SUMMARY.md` for a summary of the implementation. 