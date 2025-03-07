import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const accessToken = requestUrl.searchParams.get('access_token');
  
  // Check for hash fragment (implicit flow)
  const hasHashFragment = request.url.includes('#access_token=');
  
  // If we have a hash fragment, redirect to dashboard
  // The client-side code will handle the token
  if (hasHashFragment) {
    console.log('Detected hash fragment with access token, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If we don't have a code or access token, redirect to sign in
  if (!code && !accessToken) {
    console.log('No code or access token provided');
    return NextResponse.redirect(new URL('/auth/signin?error=No%20authentication%20code%20provided', request.url));
  }

  // If we have a code, exchange it for a session
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/auth/signin?error=Authentication%20failed', request.url));
      }
      
      // Get the session to confirm it worked
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session after exchanging code');
        return NextResponse.redirect(new URL('/auth/signin?error=No%20session%20created', request.url));
      }
      
      // Add debug information to the response
      console.log('Authentication successful, redirecting to dashboard');
      
      // Redirect to dashboard with a success parameter
      return NextResponse.redirect(new URL('/dashboard?auth=success', request.url));
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=Authentication%20error', request.url));
    }
  }
  
  // If we have an access token but no code, redirect to dashboard
  // This shouldn't normally happen with the current flow, but just in case
  if (accessToken) {
    console.log('Access token provided directly in query params, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Fallback redirect
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 