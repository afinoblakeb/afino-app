'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Create a Supabase client for browser environment
  // Unlike before, we don't need a useRef because we're using a function to get a fresh client
  // This ensures we always have the latest configuration
  const getSupabase = () => createBrowserSupabaseClient();
  
  useEffect(() => {
    console.log('[AuthProvider] Initial session check');
    
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const supabase = getSupabase();
        console.log('[AuthProvider] Fetching session from Supabase');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthProvider] Session check error:', error);
          return;
        }
        
        console.log(
          '[AuthProvider] Session check result:', 
          !!data.session, 
          'User ID:', 
          data.session?.user?.id || 'none'
        );
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('[AuthProvider] Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial session check
    checkSession();

    // Set up auth state change listener
    console.log('[AuthProvider] Setting up auth state change listener');
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(
          '[AuthProvider] Auth state changed:', 
          event, 
          'Session exists:', 
          !!currentSession, 
          'User ID:', 
          currentSession?.user?.id || 'none'
        );
        
        if (event === 'SIGNED_OUT') {
          // Clear auth state on sign out
          setSession(null);
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Update session state for these events
          setSession(currentSession);
          setUser(currentSession?.user || null);
        }
        
        setIsLoading(false);
        
        // Invalidate all queries to refetch data with new auth state
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          console.log('[AuthProvider] Invalidating queries due to auth state change:', event);
          queryClient.invalidateQueries();
        }
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      console.log('[AuthProvider] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = async () => {
    console.log('[AuthProvider] Sign out initiated');
    setIsLoading(true);
    
    try {
      const supabase = getSupabase();
      console.log('[AuthProvider] Calling Supabase signOut method');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthProvider] Error during sign out:', error);
        throw error;
      }
      
      console.log('[AuthProvider] Supabase sign out successful');
      
      // Clear React Query cache on logout
      console.log('[AuthProvider] Clearing query cache');
      queryClient.clear();
      
      // State is updated by onAuthStateChange listener
      
      // Let the middleware handle the redirect
      console.log('[AuthProvider] Refreshing router to trigger middleware redirect');
      router.refresh();
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 