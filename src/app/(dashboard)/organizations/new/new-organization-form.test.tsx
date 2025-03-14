import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewOrganizationForm from './new-organization-form';

// Mock the router
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Mock the auth provider
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock the invalidateOrganizationsCache function
const mockInvalidateCache = jest.fn();
jest.mock('@/utils/queryUtils', () => ({
  invalidateOrganizationsCache: mockInvalidateCache,
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('NewOrganizationForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();

    // Mock successful slug check
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/organizations/check-slug/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: true }),
        });
      }
      
      // Mock successful organization creation
      if (url === '/api/organizations') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            organization: {
              id: 'new-org-id',
              name: 'Test Organization',
              slug: 'test-org',
            },
          }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('should create an organization and redirect without causing infinite loops', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NewOrganizationForm />
      </QueryClientProvider>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Organization Name/i), {
      target: { value: 'Test Organization' },
    });

    fireEvent.change(screen.getByLabelText(/Organization URL/i), {
      target: { value: 'test-org' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Organization/i }));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/organizations', expect.any(Object));
    });

    // Verify that router.push was called exactly once with the correct URL
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/organizations/test-org');
    
    // Verify that invalidateOrganizationsCache was called
    expect(mockInvalidateCache).toHaveBeenCalledTimes(1);
  });
}); 