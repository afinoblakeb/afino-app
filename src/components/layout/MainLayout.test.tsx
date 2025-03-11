import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainLayout } from './MainLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/providers/AuthProvider';
import { usePathname } from 'next/navigation';

// Mock the hooks
jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

jest.mock('@/hooks/useOrganizations', () => ({
  useOrganizations: jest.fn(),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

interface SidebarProps {
  organizations: Array<{ id: string; name: string; slug: string; logoUrl?: string }>;
  currentOrganization: { id: string; name: string; slug: string; logoUrl?: string } | null;
  user: { id: string; fullName: string; email: string; avatarUrl?: string };
  onOrganizationChange: (org: { id: string; name: string; slug: string; logoUrl?: string }) => void;
}

// Mock the AppSidebar component
jest.mock('./Sidebar', () => ({
  AppSidebar: ({ organizations, currentOrganization, user }: SidebarProps) => (
    <div data-testid="app-sidebar">
      <div data-testid="org-count">Orgs: {organizations.length}</div>
      <div data-testid="current-org">{currentOrganization?.name}</div>
      <div data-testid="user-name">{user.fullName}</div>
    </div>
  ),
}));

// Mock the SidebarProvider component
jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Toggle Sidebar</button>,
}));

// Mock the NoOrganization component
jest.mock('./NoOrganization', () => ({
  NoOrganization: () => <div data-testid="no-organization">No Organization</div>,
}));

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth mock
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com', user_metadata: { full_name: 'Test User' } },
      isLoading: false,
    });

    // Default pathname mock
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  it('should show loading state when data is loading', async () => {
    // Mock loading states
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
    });

    render(<MainLayout>Test Content</MainLayout>);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render the NoOrganization component when user has no organizations', async () => {
    // Mock empty organizations
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { id: 'user-1', name: 'Test User', email: 'user@example.com' },
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [],
    });

    render(<MainLayout>Test Content</MainLayout>);

    expect(screen.getByTestId('no-organization')).toBeInTheDocument();
  });

  it('should render the sidebar and content when user has organizations', async () => {
    // Mock user profile and organizations
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { id: 'user-1', name: 'Test User', email: 'user@example.com', avatar_url: '' },
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [
        { id: 'org-1', name: 'Test Organization', slug: 'test-org', role: 'admin' },
      ],
    });

    render(<MainLayout>Test Content</MainLayout>);

    // Wait for state updates to complete
    await waitFor(() => {
      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('org-count')).toHaveTextContent('Orgs: 1');
      expect(screen.getByTestId('current-org')).toHaveTextContent('Test Organization');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('should not show NoOrganization on profile page even without organizations', async () => {
    // Mock empty organizations and profile path
    (usePathname as jest.Mock).mockReturnValue('/profile');
    
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { id: 'user-1', name: 'Test User', email: 'user@example.com' },
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [],
    });

    render(<MainLayout>Profile Content</MainLayout>);

    // On profile page, we should render the content even without organizations
    expect(screen.queryByTestId('no-organization')).not.toBeInTheDocument();
    expect(screen.getByText('Profile Content')).toBeInTheDocument();
  });

  it('should not trigger excessive API calls on prop changes', async () => {
    // Set up spy for the hook calls
    const userProfileSpy = jest.fn().mockReturnValue({
      isLoading: false,
      data: { id: 'user-1', name: 'Test User', email: 'user@example.com' },
    });

    const organizationsSpy = jest.fn().mockReturnValue({
      isLoading: false,
      data: [{ id: 'org-1', name: 'Test Organization', slug: 'test-org', role: 'admin' }],
    });

    (useUserProfile as jest.Mock).mockImplementation(userProfileSpy);
    (useOrganizations as jest.Mock).mockImplementation(organizationsSpy);

    const { rerender } = render(<MainLayout>Test Content</MainLayout>);

    // Rerender several times
    rerender(<MainLayout>Updated Content</MainLayout>);
    rerender(<MainLayout>Updated Again</MainLayout>);

    // Hooks should only be called once per render
    expect(userProfileSpy).toHaveBeenCalledTimes(3);
    expect(organizationsSpy).toHaveBeenCalledTimes(3);
    
    // React Query would normally ensure these don't trigger new API calls
    // because it would use the cached data
  });
}); 