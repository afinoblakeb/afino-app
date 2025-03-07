'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/auth/signin';
          return;
        }
        
        setUser(user);
        
        // Get user's organizations
        const response = await fetch('/api/users/me/organizations');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.user_metadata?.name || user?.email}</CardTitle>
            <CardDescription>
              {organizations.length > 0 
                ? `You belong to ${organizations.length} organization${organizations.length > 1 ? 's' : ''}`
                : 'You haven\'t joined any organizations yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is your dashboard where you can manage your account and organizations.
            </p>
          </CardContent>
        </Card>
        
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <CardTitle>{org.name}</CardTitle>
                <CardDescription>
                  {org.domain && `Domain: ${org.domain}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Role: {org.role?.name || 'Member'}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create or Join an Organization</CardTitle>
              <CardDescription>
                Get started by creating your first organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can create a new organization or join an existing one from the onboarding page.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 