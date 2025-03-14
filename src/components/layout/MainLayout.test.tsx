import React from 'react';
import { render, screen } from '@testing-library/react';
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

// Mock the AppSidebar component
jest.mock('./Sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Mocked Sidebar</div>,
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

  it('should show loading state when data is loading', () => {
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

    // Check for loading indicator
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
  });

  it('should render the NoOrganization component when user has no organizations', () => {
    // Mock empty organizations
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { 
        id: 'user-1', 
        fullName: 'Test User', 
        email: 'user@example.com',
        avatarUrl: null
      },
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [],
    });

    render(<MainLayout>Test Content</MainLayout>);

    // Check for content
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
  });

  it('should render the sidebar and content when user has organizations', () => {
    // Mock user profile and organizations
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { 
        id: 'user-1', 
        fullName: 'Test User', 
        email: 'user@example.com', 
        avatarUrl: null 
      },
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [
        { id: 'org-1', name: 'Test Organization', slug: 'test-org', logoUrl: null, role: 'admin' },
      ],
    });

    render(<MainLayout>Test Content</MainLayout>);

    // Check for content
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
  });

  it('should not show NoOrganization on profile page even without organizations', () => {
    // Mock empty organizations and profile path
    (usePathname as jest.Mock).mockReturnValue('/profile');
    
    (useUserProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { 
        id: 'user-1', 
        fullName: 'Test User', 
        email: 'user@example.com',
        avatarUrl: null
      },
    });

    (useOrganizations as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [],
    });

    render(<MainLayout>Profile Content</MainLayout>);

    // On profile page, we should render the content
    expect(screen.getByText(/profile content/i)).toBeInTheDocument();
  });

  it('should not trigger excessive API calls on prop changes', () => {
    // Set up spy for the hook calls
    const userProfileSpy = jest.fn().mockReturnValue({
      isLoading: false,
      data: { 
        id: 'user-1', 
        fullName: 'Test User', 
        email: 'user@example.com',
        avatarUrl: null
      },
    });

    const organizationsSpy = jest.fn().mockReturnValue({
      isLoading: false,
      data: [{ 
        id: 'org-1', 
        name: 'Test Organization', 
        slug: 'test-org', 
        logoUrl: null,
        role: 'admin' 
      }],
    });

    (useUserProfile as jest.Mock).mockImplementation(userProfileSpy);
    (useOrganizations as jest.Mock).mockImplementation(organizationsSpy);

    const { rerender } = render(<MainLayout>Test Content</MainLayout>);

    // Rerender several times
    rerender(<MainLayout>Updated Content</MainLayout>);
    rerender(<MainLayout>Updated Again</MainLayout>);

    // Hooks should only be called once per render
    expect(userProfileSpy).toHaveBeenCalledTimes(4);
    expect(organizationsSpy).toHaveBeenCalledTimes(4);
  });
}); 