'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  // Handle logout process
  useEffect(() => {
    async function performLogout() {
      try {
        console.log('[LogoutPage] Starting logout process');
        
        // Clear React Query cache to prevent queries with invalid auth state
        console.log('[LogoutPage] Clearing query cache');
        queryClient.clear();
        
        // Create Supabase client
        const supabase = createClient();
        
        // Call Supabase signOut method
        console.log('[LogoutPage] Calling Supabase signOut method');
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('[LogoutPage] Error during sign out:', error);
          setError(`Error signing out: ${error.message}`);
          return;
        }
        
        console.log('[LogoutPage] Logout successful, redirecting to signin');
        
        // Redirect to signin page after successful logout
        // Use a small delay to ensure everything is cleaned up
        setTimeout(() => {
          router.push('/auth/signin');
          router.refresh();
        }, 800);
        
      } catch (err) {
        console.error('[LogoutPage] Unexpected error during logout:', err);
        setError('An unexpected error occurred during logout');
      }
    }
    
    performLogout();
  }, [router, queryClient]);
  
  // Use a full-screen layout that matches MainLayout loading screens
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