'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { extractDomain, suggestOrganizationName } from '@/utils/domainUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState('');
  const [existingOrganization, setExistingOrganization] = useState<any>(null);
  const [checkingOrganization, setCheckingOrganization] = useState(true);
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [joiningOrganization, setJoiningOrganization] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not authenticated, redirect to sign in
        router.push('/auth/signin');
        return;
      }
      
      setUser(user);
      setLoading(false);
      
      // Check if there's an organization with the user's domain
      if (user.email) {
        const domain = extractDomain(user.email);
        if (domain) {
          try {
            const response = await fetch(`/api/organizations/domain/${domain}`);
            if (response.ok) {
              const data = await response.json();
              if (data.organization) {
                setExistingOrganization(data.organization);
              } else {
                // Suggest organization name based on domain
                setOrganizationName(suggestOrganizationName(domain));
              }
            }
          } catch (error) {
            console.error('Error checking organization:', error);
          }
        }
        setCheckingOrganization(false);
      }
    }
    
    getUser();
  }, [router]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) return;
    
    setCreatingOrganization(true);
    setError(null);
    
    try {
      const domain = extractDomain(user.email);
      
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organizationName,
          domain,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setCreatingOrganization(false);
    }
  };

  const handleJoinOrganization = async () => {
    if (!existingOrganization) return;
    
    setJoiningOrganization(true);
    setError(null);
    
    try {
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: existingOrganization.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join organization');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error joining organization:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setJoiningOrganization(false);
    }
  };

  const handleSkip = () => {
    // Skip organization creation/joining and go to dashboard
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Afino!</CardTitle>
          <CardDescription>
            Let's get you set up with your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {checkingOrganization ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Checking your organization...</p>
            </div>
          ) : existingOrganization ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Join Existing Organization</h3>
              <p>We found an organization matching your email domain:</p>
              <div className="p-4 border rounded-md">
                <p className="font-semibold">{existingOrganization.name}</p>
                <p className="text-sm text-gray-500">{extractDomain(user.email)}</p>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={handleJoinOrganization} 
                  disabled={joiningOrganization}
                  className="flex-1"
                >
                  {joiningOrganization ? 'Joining...' : 'Join Organization'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Not Now
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <h3 className="text-lg font-medium">Create Your Organization</h3>
              <p>We'll create an organization based on your email domain: {extractDomain(user.email)}</p>
              
              <div className="space-y-2">
                <Label htmlFor="organization-name">Organization Name</Label>
                <Input
                  id="organization-name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  disabled={creatingOrganization}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={creatingOrganization || !organizationName}
                  className="flex-1"
                >
                  {creatingOrganization ? 'Creating...' : 'Create Organization'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 