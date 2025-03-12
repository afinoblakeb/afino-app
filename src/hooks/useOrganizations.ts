'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

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
  console.error('Organizations fetch error:', error);
};

/**
 * Fetches organizations data from the API
 */
async function fetchOrganizations(userId?: string): Promise<Organization[]> {
  console.log('[useOrganizations] Fetching organizations, user ID exists:', !!userId);
  
  if (!userId) {
    console.log('[useOrganizations] No user ID provided, returning empty array');
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

    console.log('[useOrganizations] API response status:', response.status);
    
    // Check the content type of the response
    const contentType = response.headers.get('content-type') || '';
    console.log('[useOrganizations] Response content type:', contentType);

    if (!response.ok) {
      // If content type is HTML, this might be a redirect to login page
      if (contentType.includes('text/html')) {
        console.warn('[useOrganizations] Received HTML response instead of JSON, likely a redirect');
        throw new Error('Authentication required - redirecting to login');
      }
      
      const errorData = await response.json().catch(() => {
        console.error('[useOrganizations] Failed to parse error response JSON');
        return { message: 'Unknown error (failed to parse response)' };
      });
      
      console.error('[useOrganizations] Error response:', errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Skip HTML check - attempt to parse as JSON regardless of content type
    // Next.js API routes might return JSON without setting the proper content type

    try {
      const data = await response.json();
      console.log('[useOrganizations] Raw API response:', data);
      
      // Transform the nested organization data into the expected flat structure
      if (data.organizations && Array.isArray(data.organizations)) {
        console.log(`[useOrganizations] Found ${data.organizations.length} organizations`);
        
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
      
      console.log('[useOrganizations] No organizations found in response');
      return [];
    } catch (parseError) {
      console.error('[useOrganizations] JSON parsing error:', parseError);
      throw new Error('Failed to parse response as JSON');
    }
  } catch (error) {
    console.error('[useOrganizations] Error during fetch:', error);
    throw error;
  }
}

/**
 * Hook for fetching and caching user organizations data
 */
export function useOrganizations(userId?: string) {
  // Track if error was already shown
  const errorShown = useRef(false);

  const query = useQuery({
    queryKey: ['organizations', userId],
    queryFn: () => fetchOrganizations(userId),
    enabled: !!userId,
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