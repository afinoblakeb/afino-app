'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  organization: Organization;
  role: {
    id: string;
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Fetch user organizations
  useEffect(() => {
    async function fetchUserOrganizations() {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        const response = await fetch('/api/users/me/organizations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        const data = await response.json();
        setUserOrganizations(data.organizations);
      } catch (error) {
        console.error('Error fetching user organizations:', error);
        setError('Failed to load your organizations');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserOrganizations();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your organizations dashboard.
          </p>
        </div>
        <Button onClick={() => router.push('/organizations/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userOrganizations.length > 0 ? (
          userOrganizations.map((userOrg) => (
            <Card key={userOrg.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/organizations/${userOrg.organization.slug}`)}>
              <CardHeader>
                <CardTitle>{userOrg.organization.name}</CardTitle>
                <CardDescription>Role: {userOrg.role.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm truncate">{userOrg.organization.slug}</p>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full" 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/organizations/${userOrg.organization.slug}/settings`);
                        }}>
                  Manage
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle>No Organizations</CardTitle>
                <CardDescription>
                  You don&apos;t have any organizations yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first organization to get started.
                </p>
                <Button onClick={() => router.push('/organizations/new')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 