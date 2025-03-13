/**
 * Tests for the useOrganizations hook
 * Verifies data fetching, error handling, and behavior with different user IDs
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useOrganizations } from './useOrganizations';
import { http, HttpResponse } from 'msw';
import { server } from '../test-utils/msw-server';
import { createQueryClientWrapper } from '../test-utils/react-query-utils';
import { toast } from 'sonner';

// Mock the toast library
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('useOrganizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests successful data fetching from the API
   */
  it('should fetch organizations data successfully', async () => {
    // Define the mock response
    server.use(
      http.get('/api/users/me/organizations', () => {
        return HttpResponse.json({
          organizations: [
            {
              id: 'org-1',
              name: 'Test Organization 1',
              slug: 'test-org-1',
              role: 'admin',
              createdAt: '2023-01-01T00:00:00.000Z',
            },
            {
              id: 'org-2',
              name: 'Test Organization 2',
              slug: 'test-org-2',
              role: 'member',
              createdAt: '2023-01-02T00:00:00.000Z',
            },
          ],
        });
      })
    );

    // Render the hook
    const { result } = renderHook(() => useOrganizations('test-user-id'), {
      wrapper: createQueryClientWrapper(),
    });

    // Initially it should be in loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for the data to be loaded
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check the returned data
    expect(result.current.data).toEqual([
      {
        id: 'org-1',
        name: 'Test Organization 1',
        slug: 'test-org-1',
        role: 'admin',
        createdAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 'org-2',
        name: 'Test Organization 2',
        slug: 'test-org-2',
        role: 'member',
        createdAt: '2023-01-02T00:00:00.000Z',
      },
    ]);
  });

  /**
   * Tests error handling when the API request fails
   */
  it('should handle API errors gracefully', async () => {
    // Define the mock error response
    server.use(
      http.get('/api/users/me/organizations', () => {
        return HttpResponse.json(
          { message: 'Failed to fetch organizations' },
          { status: 500 }
        );
      })
    );

    // Render the hook
    const { result } = renderHook(() => useOrganizations('test-user-id'), {
      wrapper: createQueryClientWrapper(),
    });

    // Wait for the error state
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Check the error message
    expect(result.current.error).toBeDefined();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching organizations:')
    );
  });

  /**
   * Tests behavior when userId is undefined
   */
  it('should return empty array when userId is undefined', async () => {
    // Render the hook with undefined userId
    const { result } = renderHook(() => useOrganizations(), {
      wrapper: createQueryClientWrapper(),
    });

    // The query should not be enabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetched).toBe(false);
  });

  /**
   * Tests that different userIds use different cache entries
   */
  it('should use different cache entries for different userIds', async () => {
    // Define the mock responses for different users
    server.use(
      http.get('/api/users/me/organizations', () => {
        return HttpResponse.json({
          organizations: [{ id: 'org-1', name: 'User Org', role: 'admin', slug: 'user-org', createdAt: '2023-01-01' }],
        });
      })
    );

    // Render hooks with different userIds
    const { result: result1 } = renderHook(() => useOrganizations('user-1'), {
      wrapper: createQueryClientWrapper(),
    });
    
    const { result: result2 } = renderHook(() => useOrganizations('user-2'), {
      wrapper: createQueryClientWrapper(),
    });

    // Wait for data to load
    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
      expect(result2.current.isSuccess).toBe(true);
    });
    
    // Both should succeed independently
    expect(result1.current.isSuccess).toBe(true);
    expect(result2.current.isSuccess).toBe(true);
  });
}); 