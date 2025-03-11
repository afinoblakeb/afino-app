'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define types for the API response
interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
}

interface Role {
  id: string;
  name: string;
}

interface UserOrganization {
  id: string;
  organizationId: string;
  organization: Organization;
  role: Role;
}

export default function OrganizationsClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    console.log('[OrganizationsClient] Initial data fetch useEffect triggered');
    
    // EMERGENCY FIX: Implement a throttle using localStorage to prevent repeated API calls
    const lastFetchTime = localStorage.getItem('lastOrganizationsFetch');
    const now = Date.now();
    
    // If we've fetched within the last 10 seconds, don't fetch again
    if (lastFetchTime && now - parseInt(lastFetchTime) < 10000) {
      console.log('[OrganizationsClient] Skipping fetch - too recent (within 10s)');
      
      // Try to use cached data if available
      const cachedOrgs = localStorage.getItem('cachedOrganizations');
      if (cachedOrgs) {
        try {
          const parsedOrgs = JSON.parse(cachedOrgs);
          console.log('[OrganizationsClient] Using cached organizations data:', parsedOrgs.length);
          setOrganizations(parsedOrgs);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('[OrganizationsClient] Error parsing cached organizations:', e);
        }
      }
      
      return;
    }
    
    // Prevent repeated fetching that can cause refreshes
    if (isMounted.current) {
      console.log('[OrganizationsClient] Already mounted, skipping fetch');
      return;
    }
    isMounted.current = true;
    
    async function fetchOrganizations() {
      console.log('[OrganizationsClient] Fetching organizations...');
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/users/me/organizations', {
          // Use standard browser caching instead of no-store
          cache: 'default',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[OrganizationsClient] Organizations fetched successfully:', data.organizations?.length || 0);
          setOrganizations(data.organizations);
          
          // Cache the organizations data
          localStorage.setItem('cachedOrganizations', JSON.stringify(data.organizations));
          localStorage.setItem('lastOrganizationsFetch', now.toString());
        } else {
          console.error('[OrganizationsClient] Failed to fetch organizations:', response.status);
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch organizations');
        }
      } catch (err) {
        console.error('[OrganizationsClient] Error fetching organizations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching organizations');
        toast.error('Error loading organizations', {
          description: err instanceof Error ? err.message : 'Please try again later',
        });
      } finally {
        setIsLoading(false);
        console.log('[OrganizationsClient] Fetch completed');
      }
    }
    
    fetchOrganizations();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your organizations...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        </div>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Organizations</CardTitle>
            <CardDescription>
              There was a problem loading your organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button onClick={() => router.refresh()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <Button onClick={() => router.push('/organizations/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>
      
      <Separator />
      
      {organizations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Organizations</CardTitle>
            <CardDescription>
              You don&apos;t have any organizations yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create your first organization to get started</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/organizations/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{org.organization.name}</CardTitle>
                  <Badge variant="outline">{org.role.name}</Badge>
                </div>
                <CardDescription>
                  {org.organization.domain || 'No domain'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-3">
                <Button 
                  variant="default"
                  className="w-full"
                  onClick={() => router.push(`/organizations/${org.organization.slug}`)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 