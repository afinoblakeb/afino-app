'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { extractDomain, suggestOrganizationName } from '@/utils/domainUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState('');
  const [existingOrganization, setExistingOrganization] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      
      setUser(user);
      
      if (user.email) {
        const domain = extractDomain(user.email);
        if (domain) {
          try {
            // Check if organization with this domain exists
            const response = await fetch(`/api/organizations/domain/${domain}`);
            const data = await response.json();
            
            if (data.organization) {
              setExistingOrganization(data.organization);
              setActiveTab('join');
            } else {
              // Suggest organization name based on domain
              setOrganizationName(suggestOrganizationName(domain));
            }
          } catch (error) {
            console.error('Error checking organization:', error);
          }
        }
      }
      
      setLoading(false);
    }
    
    getUser();
  }, [router, supabase]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const domain = user?.email ? extractDomain(user.email) : null;
      
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
        throw new Error('Failed to create organization');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      setSubmitting(false);
    }
  };

  const handleJoinOrganization = async () => {
    setSubmitting(true);
    
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
        throw new Error('Failed to join organization');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error joining organization:', error);
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Afino</CardTitle>
          <CardDescription>
            {user?.email && (
              <span>You're signed in as <strong>{user.email}</strong></span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" disabled={!!existingOrganization}>
                Create Organization
              </TabsTrigger>
              <TabsTrigger value="join" disabled={!existingOrganization}>
                Join Organization
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateOrganization}>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization-name">Organization Name</Label>
                    <Input
                      id="organization-name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Organization'
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              {existingOrganization && (
                <div className="space-y-4 mt-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">
                      {existingOrganization.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {existingOrganization.domain}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleJoinOrganization} 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Organization'
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={handleSkip} disabled={submitting}>
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 