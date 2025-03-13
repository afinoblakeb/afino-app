'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Custom error handler for user profile queries
 */
const handleProfileError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An error occurred';
  toast.error(`Error fetching profile: ${message}`);
  console.error('Profile fetch error:', error);
};

/**
 * Fetches user profile data from the API
 */
async function fetchUserProfile(): Promise<UserProfile> {
  console.log('[useUserProfile] Fetching user profile data');
  
  try {
    const response = await fetch('/api/users/me', {
      headers: {
        'Content-Type': 'application/json',
        // Add cache control headers to prevent refetching
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });

    console.log('[useUserProfile] API response status:', response.status);
    
    // Check the content type of the response
    const contentType = response.headers.get('content-type') || '';
    console.log('[useUserProfile] Response content type:', contentType);
    
    // For debugging, log cookie presence
    const cookies = document.cookie;
    console.log('[useUserProfile] Has cookies:', !!cookies, 'Cookie count:', cookies.split(';').length);

    if (!response.ok) {
      // If content type is HTML, this might be a redirect to login page
      if (contentType.includes('text/html')) {
        console.warn('[useUserProfile] Received HTML response instead of JSON, likely a redirect');
        // Instead of throwing an error, return a default empty profile
        console.log('[useUserProfile] Returning empty profile due to HTML response');
        return { id: '', name: '', email: '' };
      }
      
      const errorData = await response.json().catch(() => {
        console.error('[useUserProfile] Failed to parse error response JSON');
        return { message: 'Unknown error (failed to parse response)' };
      });
      
      console.error('[useUserProfile] Error response:', errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Check if the response is HTML before trying to parse as JSON
    // This prevents the "Unexpected token '<'" error
    const text = await response.text();
    
    // Check if the response starts with HTML doctype or tags
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.warn('[useUserProfile] Received HTML response instead of JSON');
      // Instead of throwing an error, return a default empty profile
      console.log('[useUserProfile] Returning empty profile due to HTML response');
      return { id: '', name: '', email: '' };
    }
    
    try {
      // Parse the text as JSON
      const data = JSON.parse(text);
      console.log('[useUserProfile] Successfully fetched user profile');
      return data;
    } catch (parseError) {
      console.error('[useUserProfile] JSON parsing error:', parseError);
      // Instead of throwing an error, return a default empty profile
      console.log('[useUserProfile] Returning empty profile due to JSON parse error');
      return { id: '', name: '', email: '' };
    }
  } catch (error) {
    console.error('[useUserProfile] Error during fetch:', error);
    // Instead of re-throwing, return a default empty profile
    console.log('[useUserProfile] Returning empty profile due to fetch error');
    return { id: '', name: '', email: '' };
  }
}

/**
 * Hook for fetching and caching user profile data
 */
export function useUserProfile(enabled = true) {
  // Track if error was already shown
  const errorShown = useRef(false);
  
  // Get authentication state
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: enabled && isAuthenticated, // Only run the query if authenticated
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (error instanceof Error && 
          (error.message.includes('Authentication required') || 
           error.message.includes('Unauthorized'))) {
        console.log('[useUserProfile] Not retrying due to auth error:', error.message);
        return false;
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity, // Keep data fresh forever unless explicitly invalidated
    // Prevent automatic retries from causing infinite loops
    retryOnMount: false
  });

  // Handle errors in useEffect to prevent infinite renders
  useEffect(() => {
    if (query.error && !errorShown.current) {
      handleProfileError(query.error);
      errorShown.current = true;
    }
    
    // Reset flag when error is cleared
    if (!query.error) {
      errorShown.current = false;
    }
  }, [query.error]);

  return query;
} 