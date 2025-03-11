'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
  const [lastChecked, setLastChecked] = useState(0);
  const router = useRouter();

  // COMPLETELY DISABLED: Visibility change event handler
  // We're not using any visibility change handlers to prevent reloads

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
    console.log('[AuthProvider] Initial session check, last checked:', new Date(lastChecked).toISOString());
    
    // EMERGENCY FIX: Implement a throttle using localStorage to prevent repeated session checks
    const lastSessionCheck = localStorage.getItem('lastSessionCheck');
    const now = Date.now();
    
    // If we've checked within the last 10 seconds, don't check again
    if (lastSessionCheck && now - parseInt(lastSessionCheck) < 10000) {
      console.log('[AuthProvider] Skipping session check - too recent (within 10s)');
      
      // Try to use cached session if available
      const cachedUser = localStorage.getItem('cachedUser');
      const cachedSession = localStorage.getItem('cachedSession');
      
      if (cachedUser && cachedSession) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          const parsedSession = JSON.parse(cachedSession);
          
          console.log('[AuthProvider] Using cached session data');
          setUser(parsedUser);
          setSession(parsedSession);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('[AuthProvider] Error parsing cached session:', e);
        }
      }
    }
    
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase.auth.getSession();
        console.log('[AuthProvider] Session check result:', !!data.session);
        
        setSession(data.session);
        setUser(data.session?.user || null);
        setLastChecked(Date.now());
        
        // Cache the session data
        if (data.session) {
          localStorage.setItem('cachedUser', JSON.stringify(data.session.user));
          localStorage.setItem('cachedSession', JSON.stringify(data.session));
        }
        localStorage.setItem('lastSessionCheck', now.toString());
        
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
      }
    };

    getSession();

    console.log('[AuthProvider] Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event);
        
        // EMERGENCY FIX: Only process certain events to prevent loops
        if (event !== 'TOKEN_REFRESHED' && event !== 'USER_UPDATED') {
          setSession(session);
          setUser(session?.user || null);
          setIsLoading(false);
          setLastChecked(Date.now());
          
          // Cache the session data
          if (session) {
            localStorage.setItem('cachedUser', JSON.stringify(session.user));
            localStorage.setItem('cachedSession', JSON.stringify(session));
          }
          localStorage.setItem('lastSessionCheck', now.toString());
          
          // Handle redirect after sign in - ONLY for actual sign in/out events
          // This prevents unwanted redirects when the token is refreshed or updated
          if (event === 'SIGNED_IN' && session) {
            console.log('[AuthProvider] User signed in, redirecting to dashboard');
            router.push('/dashboard');
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthProvider] User signed out, redirecting to signin');
            router.push('/auth/signin');
          } else {
            console.log('[AuthProvider] Other auth event, not redirecting:', event);
          }
        } else {
          console.log('[AuthProvider] Ignoring', event, 'event to prevent loops');
        }
        // Don't redirect for other events like 'TOKEN_REFRESHED' or 'USER_UPDATED'
      }
    );

    return () => {
      console.log('[AuthProvider] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [router, lastChecked]);

  const signOut = async () => {
    console.log('[AuthProvider] Sign out initiated');
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      console.log('[AuthProvider] Supabase sign out successful');
      
      setSession(null);
      setUser(null);
      
      console.log('[AuthProvider] Redirecting to signin page');
      // Force a reload to clear any cached state
      window.location.href = '/auth/signin';
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