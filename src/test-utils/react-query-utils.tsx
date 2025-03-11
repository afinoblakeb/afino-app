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
 * Simulates a tab visibility change
 */
export const simulateVisibilityChange = (isVisible: boolean) => {
  Object.defineProperty(document, 'visibilityState', {
    value: isVisible ? 'visible' : 'hidden',
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

/**
 * Simulates a rapid series of tab visibility changes
 */
export const simulateRapidVisibilityChanges = (count: number = 5, intervalMs: number = 100) => {
  return new Promise<void>((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      const isVisible = i % 2 === 0;
      simulateVisibilityChange(isVisible);
      i++;
      
      if (i >= count * 2) {
        clearInterval(interval);
        resolve();
      }
    }, intervalMs);
  });
};

/**
 * Waits for a specified duration
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)); 