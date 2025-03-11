'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

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
  const response = await fetch('/api/users/me', {
    headers: {
      'Content-Type': 'application/json',
      // Add cache control headers to prevent refetching
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  return await response.json();
}

/**
 * Hook for fetching and caching user profile data
 */
export function useUserProfile(enabled = true) {
  // Track if error was already shown
  const errorShown = useRef(false);

  const query = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled,
    retry: 1,
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