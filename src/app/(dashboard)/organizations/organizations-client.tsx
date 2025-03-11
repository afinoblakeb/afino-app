'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle, Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOrganizations } from '@/hooks/useOrganizations';

// Define the Organization interface to match the hook's return type
interface Organization {
  id: string;
  name: string;
  slug: string;
  role?: string;
  domain?: string | null;
}

export default function OrganizationsClient() {
  const router = useRouter();
  
  // Fetch user profile data using React Query
  const { 
    data: userProfile, 
    isLoading: isProfileLoading 
  } = useUserProfile();
  
  // Fetch organizations data using React Query
  const { 
    data: organizations, 
    isLoading: isOrgsLoading, 
    error,
    refetch
  } = useOrganizations(userProfile?.id);
  
  const isLoading = isProfileLoading || isOrgsLoading;

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
            <p className="mb-4">{error instanceof Error ? error.message : 'Failed to load organizations'}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button onClick={() => {
              refetch();
              toast.info('Refreshing your organizations...');
            }}>
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
      
      {!organizations || organizations.length === 0 ? (
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
          {organizations.map((org: Organization) => (
            <Card key={org.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                  <Badge variant="outline">{org.role || 'Member'}</Badge>
                </div>
                <CardDescription>
                  {org.domain || 'No domain'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-3">
                <Button 
                  variant="default"
                  className="w-full"
                  onClick={() => router.push(`/organizations/${org.slug}`)}
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