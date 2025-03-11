'use client';

import { useEffect, useState } from 'react';
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
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/me/organizations');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch organizations');
        }
        
        const data = await response.json();
        setUserOrganizations(data.organizations);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching organizations');
        toast.error('Error loading organizations', {
          description: err instanceof Error ? err.message : 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrganizations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your organizations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              View and manage your organization memberships
            </p>
          </div>
        </div>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>Failed to load organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.refresh()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            View and manage your organization memberships
          </p>
        </div>
        <Button onClick={() => router.push('/organizations/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>
      
      <Separator />
      
      {userOrganizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Organizations Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You don&apos;t belong to any organizations yet. Create your first organization to get started.
          </p>
          <Button onClick={() => router.push('/organizations/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userOrganizations.map((membership) => (
            <Card key={membership.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{membership.organization.name}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-1">
                    {membership.role.name}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  slug: {membership.organization.slug}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push(`/organizations/${membership.organization.slug}/settings`)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  onClick={() => router.push(`/organizations/${membership.organization.slug}`)}
                >
                  View Dashboard
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 