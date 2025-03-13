'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * LogoutPage component handles the user logout process.
 * It performs the following actions:
 * 1. Clears the React Query cache to prevent queries with invalid auth state
 * 2. Signs out the user using Supabase auth
 * 3. Redirects to the sign-in page after successful logout
 * 4. Displays appropriate error messages if logout fails
 */
export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  // Handle logout process
  useEffect(() => {
    async function performLogout() {
      try {
        // Clear React Query cache to prevent queries with invalid auth state
        queryClient.clear();
        
        // Create Supabase client
        const supabase = createClient();
        
        // Call Supabase signOut method
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          setError(`Error signing out: ${error.message}`);
          return;
        }
        
        // Redirect to signin page after successful logout
        // Use a small delay to ensure everything is cleaned up
        setTimeout(() => {
          router.push('/auth/signin');
          router.refresh();
        }, 800);
        
      } catch {
        // Catch any unexpected errors
        setError('An unexpected error occurred during logout');
      }
    }
    
    performLogout();
  }, [router, queryClient]);
  
  // Display error state if logout fails
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
            <p className="font-medium mb-2">There was a problem signing you out</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="text-primary hover:underline text-sm"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }
  
  // Loading state - matches MainLayout exactly
  return (
    <div className="flex h-screen items-center justify-center w-full bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Signing you out...</span>
    </div>
  );
} 