"use client";

import { ReactNode, useState } from 'react';
import { AppSidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

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
  const { user, isLoading } = useAuth();

  // Mock data for demonstration purposes
  // In a real app, this would come from your API/database
  const organizations: Organization[] = [
    {
      id: '1',
      name: 'Default Organization',
      slug: 'default-organization',
      logoUrl: '',
    },
    {
      id: '2',
      name: 'Acme Inc',
      slug: 'acme-inc',
      logoUrl: '',
    },
    {
      id: '3',
      name: 'Startup Co',
      slug: 'startup-co',
      logoUrl: '',
    },
  ];

  const [currentOrganization, setCurrentOrganization] = useState<Organization>(organizations[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen bg-background">
        <AppSidebar
          organizations={organizations}
          currentOrganization={currentOrganization}
          user={userProfile}
          onOrganizationChange={handleOrganizationChange}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4">
            <SidebarTrigger className="mb-6" />
          </div>
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-2xl font-bold mb-6">Afino Platform</h1>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 