'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { NoOrganization } from './NoOrganization';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOrganizations } from '@/hooks/useOrganizations';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  // Get authentication state from AuthProvider
  const { user, isLoading: isAuthLoading, isAuthenticated, } = useAuth();
  const pathname = usePathname();

  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch user profile using React Query - only if authenticated
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile(isAuthenticated);

  // Fetch organizations using React Query - only if we have a user profile
  const { data: organizations, isLoading: isOrgsLoading, refetch: refetchOrganizations } = useOrganizations(userProfile?.id);

  // Set current organization to first one by default, but initialize as null
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  
  // Create a flag to track if this is the initial mount
  const isInitialMount = useRef(true);

  // Refetch organizations when the component mounts or when the pathname changes
  // This ensures we have the latest data after creating a new organization
  useEffect(() => {
    // Only refetch if this is not the initial mount and we have a user profile
    if (!isInitialMount.current && isAuthenticated && userProfile?.id) {
      // Extract the organization slug from the pathname if it exists
      const pathSlug = pathname?.includes('/organizations/') 
        ? pathname.split('/organizations/')[1]?.split('/')[0]
        : null;
      
      // Only refetch if we're on an organization page and the slug doesn't match any current organization
      if (pathSlug && organizations && !organizations.some(org => org.slug === pathSlug)) {
        refetchOrganizations();
      }
    }
    
    // Mark that we've passed the initial mount
    isInitialMount.current = false;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Update current organization when organizations data loads
  useEffect(() => {
    if (organizations && organizations.length > 0) {
      // If we have a slug in the pathname, try to find that organization
      if (pathname?.includes('/organizations/')) {
        const slug = pathname.split('/organizations/')[1]?.split('/')[0];
        const matchingOrg = organizations.find(org => org.slug === slug);
        
        if (matchingOrg) {
          setCurrentOrganization({
            id: matchingOrg.id || '',
            name: matchingOrg.name || 'Organization',
            slug: matchingOrg.slug || '',
            logoUrl: '',
          });
          return;
        }
      }
      
      // If no matching org found or not on an org page, use the first one
      if (!currentOrganization || !organizations.some(org => org.id === currentOrganization.id)) {
        setCurrentOrganization({
          id: organizations[0].id || '',
          name: organizations[0].name || 'Organization',
          slug: organizations[0].slug || '',
          logoUrl: '',
        });
      }
    }
  }, [organizations, pathname, currentOrganization]);

  const mappedUserProfile = userProfile
    ? {
        id: userProfile.id,
        fullName: userProfile.name || 'User',
        email: userProfile.email || '',
        avatarUrl: userProfile.avatar_url || '',
      }
    : {
        id: user?.id || '',
        fullName: user?.user_metadata?.full_name || 'User',
        email: user?.email || '',
        avatarUrl: user?.user_metadata?.avatar_url || '',
      };

  const handleOrganizationChange = (organization: Organization) => {
    setCurrentOrganization(organization);
  };


  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading authentication...</span>
      </div>
    );
  }

  // If not authenticated, show the children (middleware will handle redirect)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading state while loading profile or organizations
  if (isProfileLoading || isOrgsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading user data...</span>
      </div>
    );
  }

  // If user has no organizations and not on the create or join page
  if (
    (!organizations || organizations.length === 0) &&
    !pathname?.includes('/organizations/new') &&
    !pathname?.includes('/organizations/join') &&
    !pathname?.includes('/profile')
  ) {
    return <NoOrganization />;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        {currentOrganization && (
          <AppSidebar
            organizations={
              organizations?.map((org) => ({
                id: org.id || '',
                name: org.name || 'Organization',
                slug: org.slug || '',
                logoUrl: '',
              })) || []
            }
            currentOrganization={currentOrganization}
            user={mappedUserProfile}
            onOrganizationChange={handleOrganizationChange}
          />
        )}
        <div className="flex-1 relative w-full">
          <main className="h-full overflow-y-auto">
            <div className="p-4">
              <SidebarTrigger className="mb-6" />
            </div>
            <div className="px-12 md:px-12 w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
