'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: string;
  domain?: string | null;
  [key: string]: unknown;
}

// Define the response type from the API
interface ApiOrganization {
  id: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
  };
  role: {
    id: string;
    name: string;
  };
}

/**
 * Custom error handler for organizations queries
 */
const handleOrganizationsError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An error occurred';
  toast.error(`Error fetching organizations: ${message}`);
};

/**
 * Fetches organizations data from the API
 */
async function fetchOrganizations(userId?: string): Promise<Organization[]> {
  if (!userId) {
    return [];
  }

  try {
    const response = await fetch('/api/users/me/organizations', {
      headers: {
        'Content-Type': 'application/json',
        // Add cache control headers to prevent refetching
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });
    
    // Check the content type of the response
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      // If content type is HTML, this might be a redirect to login page
      if (contentType.includes('text/html')) {
        // Instead of throwing an error, return an empty array
        return [];
      }
      
      const errorData = await response.json().catch(() => {
        return { message: 'Unknown error (failed to parse response)' };
      });
      
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Check if the response is HTML before trying to parse as JSON
    // This prevents the "Unexpected token '<'" error
    const text = await response.text();
    
    // Check if the response starts with HTML doctype or tags
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      // Instead of throwing an error, return an empty array
      return [];
    }
    
    try {
      // Parse the text as JSON
      const data = JSON.parse(text);
      
      // Transform the nested organization data into the expected flat structure
      if (data.organizations && Array.isArray(data.organizations)) {
        return data.organizations.map((org: ApiOrganization) => ({
          id: org.organizationId || org.id || '',
          name: org.organization?.name || 'Unnamed Organization',
          slug: org.organization?.slug || '',
          role: org.role?.name || 'Member',
          // Include other properties you need in a flat structure
          domain: org.organization?.domain || null,
          createdAt: new Date().toISOString() // Default if not provided
        }));
      }
      
      return [];
    } catch {
      // Instead of throwing an error, return an empty array
      return [];
    }
  } catch {
    // Instead of re-throwing, return an empty array
    return [];
  }
}

/**
 * Hook for fetching and caching user organizations data
 */
export function useOrganizations(userId?: string) {
  // Track if error was already shown
  const errorShown = useRef(false);
  
  // Get authentication state
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['organizations', userId],
    queryFn: () => fetchOrganizations(userId),
    enabled: !!userId && isAuthenticated, // Only run the query if authenticated and userId exists
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (error instanceof Error && 
          (error.message.includes('Authentication required') || 
           error.message.includes('Unauthorized'))) {
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
      handleOrganizationsError(query.error);
      errorShown.current = true;
    }
    
    // Reset flag when error is cleared
    if (!query.error) {
      errorShown.current = false;
    }
  }, [query.error]);

  return query;
} 