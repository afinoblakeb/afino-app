import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

/**
 * Creates a new QueryClient instance for testing
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Turn off retries during testing
        retry: false,
        // Don't cache between tests
        gcTime: 0, // Previously cacheTime in v4
        // Prevent refetching on window focus during tests
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * Creates a wrapper component with the QueryClientProvider
 */
export const createQueryClientWrapper = () => {
  const testQueryClient = createTestQueryClient();
  
  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  
  TestWrapper.displayName = 'QueryClientTestWrapper';
  
  return TestWrapper;
};

/**
 * Custom render function that includes QueryClientProvider
 */
export const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  
  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  
  TestWrapper.displayName = 'QueryClientTestWrapper';

  return render(ui, { wrapper: TestWrapper });
};

/**
 * Waits for a specified duration
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)); 