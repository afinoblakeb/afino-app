'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Create a Supabase client for browser environment
  // Unlike before, we don't need a useRef because we're using a function to get a fresh client
  // This ensures we always have the latest configuration
  const getSupabase = () => createClient();
  
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
          setIsAuthenticated(false);
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
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error('[AuthProvider] Error checking session:', error);
        setIsAuthenticated(false);
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
          setIsAuthenticated(false);
          
          // Clear all queries on sign out
          console.log('[AuthProvider] Clearing query cache on sign out');
          queryClient.clear();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Update session state for these events
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setIsAuthenticated(!!currentSession);
          
          // Invalidate queries on sign in to refresh data
          if (event === 'SIGNED_IN') {
            console.log('[AuthProvider] Invalidating queries on sign in');
            queryClient.invalidateQueries();
          }
        }
        
        setIsLoading(false);
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
    
    // Set logging out state to true immediately
    setIsLoggingOut(true);
    
    try {
      // Simply redirect to the logout page
      // The actual logout process will be handled there
      console.log('[AuthProvider] Redirecting to logout page');
      router.push('/logout');
    } catch (error) {
      console.error('[AuthProvider] Error during sign out redirect:', error);
      // If there's an error with the redirect, reset the logging out state
      setIsLoggingOut(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    isAuthenticated,
    isLoggingOut,
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