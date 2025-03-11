import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useUserProfile } from './useUserProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { simulateVisibilityChange } from '../test-utils/react-query-utils';

// Mock fetch so we can count how many times it's called
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Tab Visibility Change Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      }),
    });
  });

  it('should not trigger excessive API calls on rapid tab visibility changes', async () => {
    // Create a wrapper with default settings
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: {
                  staleTime: 60000, // 1 minute
                  retry: false,
                  refetchOnWindowFocus: true,
                },
              },
            })
          }
        >
          {children}
        </QueryClientProvider>
      );
    };

    // Render the hook
    renderHook(() => useUserProfile(), { wrapper });

    // Wait for the initial fetch to complete
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    mockFetch.mockClear();

    // Simulate rapid tab switching (hidden->visible->hidden->visible)
    simulateVisibilityChange(false);
    simulateVisibilityChange(true);
    simulateVisibilityChange(false);
    simulateVisibilityChange(true);

    // Wait a moment to ensure any debounced actions would have completed
    await new Promise(resolve => setTimeout(resolve, 100));

    // In React Query's default configuration, refetchOnWindowFocus is true,
    // but it has built-in throttling to prevent excessive calls
    // Verify that we don't have more than one fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should refetch data when tab becomes visible after staleTime', async () => {
    // Create a wrapper with short staleTime
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: {
                  staleTime: 10, // Very short stale time
                  retry: false,
                  refetchOnWindowFocus: true,
                },
              },
            })
          }
        >
          {children}
        </QueryClientProvider>
      );
    };

    // Render the hook
    renderHook(() => useUserProfile(), { wrapper });

    // Wait for the initial fetch to complete
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    mockFetch.mockClear();

    // Wait for the data to become stale
    await new Promise(resolve => setTimeout(resolve, 20));

    // Simulate tab becoming visible again
    simulateVisibilityChange(false);
    simulateVisibilityChange(true);

    // Wait a moment to ensure refetch happens
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });
}); 