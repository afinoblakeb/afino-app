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

  // Add a visibility change event handler to prevent unnecessary session checks
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Only check session on visibility change if it's been more than 5 minutes
      if (document.visibilityState === 'visible' && 
          Date.now() - lastChecked > 5 * 60 * 1000) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
          setLastChecked(Date.now());
          // Do NOT redirect to dashboard here - this would cause unwanted redirects
        } catch (error) {
          console.error('Error checking session on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastChecked]);

  // Check for hash fragment in URL (from OAuth redirect)
  useEffect(() => {
    const checkHashFragment = async () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        try {
          // Let Supabase handle the hash fragment
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            // Explicitly set the session in cookies
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            
            // Clear the hash fragment
            window.location.hash = '';
            
            // Force a hard reload to ensure cookies are properly set
            window.location.href = '/dashboard';
          }
        } catch {
          // Handle error silently
        }
      }
    };
    
    checkHashFragment();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase.auth.getSession();
        
        setSession(data.session);
        setUser(data.session?.user || null);
        setLastChecked(Date.now());
        
        // If we have a session but are on an auth page, redirect to dashboard
        // ONLY redirect if we're on an auth page, not for general session checks
        if (data.session && typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
          router.push('/dashboard');
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
        setLastChecked(Date.now());
        
        // Handle redirect after sign in - ONLY for actual sign in/out events
        // This prevents unwanted redirects when the token is refreshed or updated
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth/signin');
        }
        // Don't redirect for other events like 'TOKEN_REFRESHED' or 'USER_UPDATED'
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      
      setSession(null);
      setUser(null);
      
      // Force a reload to clear any cached state
      window.location.href = '/auth/signin';
    } catch {
      // Handle error silently
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