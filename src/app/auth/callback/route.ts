import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin?error=No%20code%20provided', request.url));
  }

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