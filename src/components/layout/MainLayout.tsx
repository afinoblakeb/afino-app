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

  // Check if current page is profile or organizations
  const isFullWidthPage = pathname?.includes('/profile') || 
                          pathname?.includes('/organizations');

  // Fetch user organizations from API
  useEffect(() => {
    async function fetchUserOrganizations() {
      if (!user) return;
      
      try {
        setIsLoadingOrgs(true);
        const response = await fetch('/api/users/me/organizations', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json() as UserOrganizationResponse;
          
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
          } else {
            // No organizations found
            setUserOrganizations([]);
            setCurrentOrganization(null);
          }
        } else {
          console.error('Failed to fetch organizations');
          toast.error('Failed to load your organizations');
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Error loading your organizations');
      } finally {
        setIsLoadingOrgs(false);
      }
    }
    
    fetchUserOrganizations();
  }, [user]);

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
      <div className="flex h-screen bg-background">
        {currentOrganization && (
          <AppSidebar
            organizations={userOrganizations}
            currentOrganization={currentOrganization}
            user={userProfile}
            onOrganizationChange={handleOrganizationChange}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4">
            <SidebarTrigger className="mb-6" />
          </div>
          <div className={isFullWidthPage ? "px-4 md:px-6 w-full max-w-full" : "container mx-auto px-4 md:px-6"}>
            {!isFullWidthPage && <h1 className="text-2xl font-bold mb-6">Afino Platform</h1>}
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 