'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';

/**
 * DashboardPage component displays the main dashboard for authenticated users
 * It verifies authentication and displays dashboard content or redirects to sign-in
 */
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggingOut } = useAuth();
  
  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        
        // Create a Supabase client for browser environment
        // The client will automatically handle code exchange if there's a code in the URL
        // This is configured in the client setup with detectSessionInUrl: true
        const supabase = createClient();
        
        // Check if user is authenticated
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError) {
          setError('Authentication error: ' + getUserError.message);
          setLoading(false);
          return;
        }
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
 
        
      } catch {
        setError('Authentication error');
      } finally {
        setLoading(false);
      }
    }
    
    // Only check auth if not in the process of logging out
    if (!isLoggingOut) {
      checkAuth();
    }
  }, [router, isLoggingOut]);

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
      
      {/* Only show error if not logging out */}
      {error && !isLoggingOut && (
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