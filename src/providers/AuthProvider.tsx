'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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
  // Track if this is an initial auth check or a subsequent check
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  // Check for hash fragment in URL (from OAuth redirect)
  useEffect(() => {
    console.log('[AuthProvider] Checking for hash fragment');
    const checkHashFragment = async () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        console.log('[AuthProvider] Hash fragment found:', window.location.hash);
        try {
          // Let Supabase handle the hash fragment
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            console.log('[AuthProvider] Session found in hash fragment, setting session');
            // Explicitly set the session in cookies
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            
            // Clear the hash fragment
            window.location.hash = '';
            
            console.log('[AuthProvider] Redirecting to dashboard after hash fragment handling');
            // Force a hard reload to ensure cookies are properly set
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('[AuthProvider] Error handling hash fragment:', error);
        }
      } else {
        console.log('[AuthProvider] No hash fragment found');
      }
    };
    
    checkHashFragment();
  }, []);

  useEffect(() => {
    console.log('[AuthProvider] Initial session check');
    
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase.auth.getSession();
        console.log('[AuthProvider] Session check result:', !!data.session);
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // If we have a session but are on an auth page, redirect to dashboard
        // ONLY redirect if we're on an auth page, not for general session checks
        if (data.session && typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
          console.log('[AuthProvider] Redirecting from auth page to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[AuthProvider] Error checking session:', error);
      } finally {
        setIsLoading(false);
        setInitialAuthCheckComplete(true);
      }
    };

    getSession();

    console.log('[AuthProvider] Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event);
        
        // Only process relevant events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setSession(session);
          setUser(session?.user || null);
          setIsLoading(false);
          
          // Invalidate all queries to refetch data with new auth state
          queryClient.invalidateQueries();
          
          // Only handle redirects on explicit sign-in/sign-out actions, not token refreshes
          if (event === 'SIGNED_IN' && session && !initialAuthCheckComplete) {
            console.log('[AuthProvider] User signed in, redirecting to dashboard');
            router.push('/dashboard');
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthProvider] User signed out, redirecting to signin');
            router.push('/auth/signin');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Just update the session without triggering refetches or redirects
          console.log('[AuthProvider] Token refreshed, updating session without redirect');
          setSession(session);
          setUser(session?.user || null);
        } else {
          console.log('[AuthProvider] Ignoring other auth event:', event);
        }
      }
    );

    return () => {
      console.log('[AuthProvider] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [router, queryClient, initialAuthCheckComplete]);

  const signOut = async () => {
    console.log('[AuthProvider] Sign out initiated');
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      console.log('[AuthProvider] Supabase sign out successful');
      
      // Clear React Query cache on logout
      queryClient.clear();
      
      setSession(null);
      setUser(null);
      
      console.log('[AuthProvider] Redirecting to signin page');
      router.push('/auth/signin');
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