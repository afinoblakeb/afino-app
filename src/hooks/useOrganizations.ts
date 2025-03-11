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
  if (!userId) {
    return [];
  }

  const response = await fetch('/api/users/me/organizations', {
    headers: {
      'Content-Type': 'application/json',
      // Add cache control headers to prevent refetching
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch organizations');
  }

  const data = await response.json();
  
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