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

/**
 * AuthProvider manages authentication state throughout the application.
 * It handles session checking, auth state changes, and sign out functionality.
 * This provider should wrap any components that need access to authentication state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Create a Supabase client for browser environment
  // Using a function to get a fresh client ensures we always have the latest configuration
  const getSupabase = () => createClient();
  
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setIsAuthenticated(false);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        setIsAuthenticated(!!data.session);
      } catch {
        // Catch any unexpected errors and set not authenticated
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial session check
    checkSession();

    // Set up auth state change listener
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_OUT') {
          // Clear auth state on sign out
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          
          // Clear all queries on sign out
          queryClient.clear();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Update session state for these events
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setIsAuthenticated(!!currentSession);
          
          // Invalidate queries on sign in to refresh data
          if (event === 'SIGNED_IN') {
            queryClient.invalidateQueries();
          }
        }
        
        setIsLoading(false);
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  /**
   * Signs the user out by redirecting to the logout page.
   * The actual logout process is handled in the logout page component.
   */
  const signOut = async () => {
    // Set logging out state to true immediately
    setIsLoggingOut(true);
    
    try {
      // Redirect to the logout page where the actual logout process is handled
      router.push('/logout');
    } catch {
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

/**
 * Hook to access the authentication context.
 * Must be used within an AuthProvider component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 