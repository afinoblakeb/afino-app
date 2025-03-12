'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        
        // Create a Supabase client for browser environment
        // The client will automatically handle code exchange if there's a code in the URL
        // This is configured in the client setup with detectSessionInUrl: true
        const supabase = createBrowserSupabaseClient();
        
        // Check if user is authenticated
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError) {
          console.error('[Dashboard] Error getting user:', getUserError);
          setError('Authentication error: ' + getUserError.message);
          setLoading(false);
          return;
        }
        
        if (!user) {
          console.log('[Dashboard] No authenticated user found, redirecting to sign-in');
          router.push('/auth/signin');
          return;
        }
        
        console.log('[Dashboard] Authenticated user found:', user.id);
        
      } catch (error) {
        console.error('[Dashboard] Error checking authentication:', error);
        setError('Authentication error');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard.
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key metrics for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your dashboard content will appear here.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Helpful links and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documentation and resources will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 