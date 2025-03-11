"use client";

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { NoOrganization } from './NoOrganization';
import { toast } from 'sonner';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

interface UserOrganizationResponse {
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      slug: string;
      domain?: string | null;
    };
  }>;
}

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  // Get authentication state from AuthProvider
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  
  // States
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Fetch user organizations from API
  useEffect(() => {
    console.log('[MainLayout] useEffect for fetching organizations triggered');
    
    // EMERGENCY FIX: Implement a throttle using localStorage to prevent repeated API calls
    const lastFetchTime = localStorage.getItem('lastOrganizationsFetch');
    const now = Date.now();
    
    // If we've fetched within the last 10 seconds, don't fetch again
    if (lastFetchTime && now - parseInt(lastFetchTime) < 10000) {
      console.log('[MainLayout] Skipping fetch - too recent (within 10s)');
      
      // Try to use cached data if available
      const cachedOrgs = localStorage.getItem('cachedOrganizations');
      if (cachedOrgs) {
        try {
          const parsedOrgs = JSON.parse(cachedOrgs);
          console.log('[MainLayout] Using cached organizations data:', parsedOrgs.length);
          setUserOrganizations(parsedOrgs);
          if (parsedOrgs.length > 0) {
            setCurrentOrganization(parsedOrgs[0]);
          }
          setIsLoadingOrgs(false);
          return;
        } catch (e) {
          console.error('[MainLayout] Error parsing cached organizations:', e);
        }
      }
      
      return;
    }
    
    async function fetchUserOrganizations() {
      if (!user) {
        console.log('[MainLayout] No user, skipping fetch');
        return;
      }
      
      // Skip fetching if we already have organizations loaded
      if (userOrganizations.length > 0 && !isLoadingOrgs) {
        console.log('[MainLayout] Organizations already loaded, skipping fetch');
        return;
      }
      
      console.log('[MainLayout] Fetching organizations...');
      try {
        setIsLoadingOrgs(true);
        const response = await fetch('/api/users/me/organizations', {
          cache: 'default' // Use browser's standard cache control
        });
        
        if (response.ok) {
          const data = await response.json() as UserOrganizationResponse;
          console.log('[MainLayout] Organizations fetched successfully:', data.organizations?.length || 0);
          
          if (data.organizations && data.organizations.length > 0) {
            const mappedOrgs = data.organizations.map((org) => ({
              id: org.organization.id,
              name: org.organization.name,
              slug: org.organization.slug,
              logoUrl: '', // Add logoUrl if available
            }));
            
            setUserOrganizations(mappedOrgs);
            
            // Set the first organization as the current one
            setCurrentOrganization(mappedOrgs[0]);
            
            // Cache the organizations in localStorage
            localStorage.setItem('cachedOrganizations', JSON.stringify(mappedOrgs));
            localStorage.setItem('lastOrganizationsFetch', now.toString());
          } else {
            // No organizations found
            console.log('[MainLayout] No organizations found');
            setUserOrganizations([]);
            setCurrentOrganization(null);
            
            // Cache empty array
            localStorage.setItem('cachedOrganizations', JSON.stringify([]));
            localStorage.setItem('lastOrganizationsFetch', now.toString());
          }
        } else {
          console.error('[MainLayout] Failed to fetch organizations');
          toast.error('Failed to load your organizations');
        }
      } catch (error) {
        console.error('[MainLayout] Error fetching organizations:', error);
        toast.error('Error loading your organizations');
      } finally {
        setIsLoadingOrgs(false);
      }
    }
    
    fetchUserOrganizations();
  }, [user]); // Only depend on user

  const userProfile = user ? {
    id: user.id,
    fullName: user.user_metadata?.full_name || 'User',
    email: user.email || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
  } : {
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: '',
  };

  const handleOrganizationChange = (organization: Organization) => {
    setCurrentOrganization(organization);
  };

  // Show loading state while checking authentication
  if (isLoading || isLoadingOrgs) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }
  
  // If user has no organizations and not on the create or join page
  if (userOrganizations.length === 0 && 
      !pathname?.includes('/organizations/new') && 
      !pathname?.includes('/organizations/join') &&
      !pathname?.includes('/profile')) {
    return <NoOrganization />;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        {currentOrganization && (
          <AppSidebar
            organizations={userOrganizations}
            currentOrganization={currentOrganization}
            user={userProfile}
            onOrganizationChange={handleOrganizationChange}
          />
        )}
        <div className="flex-1 relative w-full">
          <main className="h-full overflow-y-auto">
            <div className="p-4">
              <SidebarTrigger className="mb-6" />
            </div>
            <div className="px-12 md:px-12 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 