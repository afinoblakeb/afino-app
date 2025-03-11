'use client';

import React, { useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider wraps the application with a React Query client.
 * This provides caching, deduplication of requests, and other benefits
 * to help solve the infinite API calls issue.
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Create a client instance in the component to ensure it's not shared between requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000, // 1 minute
        gcTime: 3600000, // 1 hour (previously cacheTime in v4)
        refetchOnWindowFocus: false, // Disable auto-refetch on window focus (can cause infinite loops)
        retry: 1, // Only retry once
        retryDelay: 1000, // Wait 1 second before retrying
        refetchOnMount: false, // Disable auto-refetch on mount (can cause cascading requests)
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}; 