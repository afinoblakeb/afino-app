/**
 * Tests for the useUserProfile hook
 * Verifies data fetching, error handling, and the enabled flag functionality
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';
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

describe('useUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests successful data fetching from the API
   */
  it('should fetch user profile data successfully', async () => {
    // Define the mock response
    server.use(
      http.get('/api/users/me', () => {
        return HttpResponse.json({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          avatar_url: 'https://example.com/avatar.png',
        });
      })
    );

    // Render the hook
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createQueryClientWrapper(),
    });

    // Initially it should be in loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for the data to be loaded
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check the returned data
    expect(result.current.data).toEqual({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://example.com/avatar.png',
    });
  });

  /**
   * Tests error handling when the API request fails
   */
  it('should handle API errors gracefully', async () => {
    // Define the mock error response
    server.use(
      http.get('/api/users/me', () => {
        return HttpResponse.json(
          { message: 'Failed to fetch user profile' },
          { status: 500 }
        );
      })
    );

    // Render the hook
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createQueryClientWrapper(),
    });

    // Wait for the error state
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Check the error message
    expect(result.current.error).toBeDefined();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching profile:')
    );
  });

  /**
   * Tests that the hook respects the enabled flag
   */
  it('should respect the enabled flag', async () => {
    // Render the hook with enabled set to false
    const { result } = renderHook(() => useUserProfile(false), {
      wrapper: createQueryClientWrapper(),
    });

    // The query should not auto-fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetched).toBe(false);
  });
}); 