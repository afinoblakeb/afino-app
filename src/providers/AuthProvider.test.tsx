import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from './AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile } from '../hooks/useUserProfile';
import { useOrganizations } from '../hooks/useOrganizations';

// Mock the hooks
jest.mock('../hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

jest.mock('../hooks/useOrganizations', () => ({
  useOrganizations: jest.fn(),
}));

// Mock component to test integration
const TestComponent = () => {
  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { data: orgs, isLoading: isOrgsLoading } = useOrganizations(user?.id);

  return (
    <div>
      {isUserLoading && <div data-testid="loading-user">Loading user...</div>}
      {user && <div data-testid="user-data">{user.name}</div>}
      
      {isOrgsLoading && <div data-testid="loading-orgs">Loading organizations...</div>}
      {orgs && <div data-testid="orgs-count">Orgs: {orgs.length}</div>}
    </div>
  );
};

describe('AuthProvider with React Query Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should properly integrate with React Query hooks', async () => {
    // Mock the hooks to return loading state first, then data
    const mockUser = { id: 'user-1', name: 'Test User' };
    const mockOrgs = [{ id: 'org-1', name: 'Test Org' }];
    
    // Setup the user profile hook mock
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: true,
      data: undefined,
    });
    
    // Setup the organizations hook mock
    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: true,
      data: undefined,
    });

    // Create a query client
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Render the component with providers
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    // Initially, both should be loading
    expect(screen.getByTestId('loading-user')).toBeInTheDocument();
    expect(screen.getByTestId('loading-orgs')).toBeInTheDocument();

    // Update the user profile hook to return data
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockUser,
    });

    // Wait for the user data to appear
    await waitFor(() => {
      expect(screen.getByTestId('user-data')).toBeInTheDocument();
    });

    // Update the organizations hook to return data
    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockOrgs,
    });

    // Wait for the orgs data to appear
    await waitFor(() => {
      expect(screen.getByTestId('orgs-count')).toBeInTheDocument();
    });

    // Verify the correct data is displayed
    expect(screen.getByTestId('user-data')).toHaveTextContent('Test User');
    expect(screen.getByTestId('orgs-count')).toHaveTextContent('Orgs: 1');
  });

  it('should handle auth state changes and refetch data', async () => {
    // Mock the hooks
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { id: 'user-1', name: 'Test User' },
      refetch: jest.fn(),
    });
    
    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [{ id: 'org-1', name: 'Test Org' }],
      refetch: jest.fn(),
    });

    // Create a query client
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Render the component with providers
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    // Verify initial data is displayed
    expect(screen.getByTestId('user-data')).toHaveTextContent('Test User');
    expect(screen.getByTestId('orgs-count')).toHaveTextContent('Orgs: 1');

    // Simulate auth state change by invalidating queries
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['organizations'] });

    // Update the user profile hook to return new data
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { id: 'user-2', name: 'New User' },
      refetch: jest.fn(),
    });
    
    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [{ id: 'org-1', name: 'Test Org' }, { id: 'org-2', name: 'New Org' }],
      refetch: jest.fn(),
    });

    // Wait for the updated data to appear
    await waitFor(() => {
      expect(screen.getByTestId('user-data')).toHaveTextContent('New User');
      expect(screen.getByTestId('orgs-count')).toHaveTextContent('Orgs: 2');
    });
  });
}); 