import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the session and handles route protection for the application.
 * This middleware function:
 * 1. Creates a Supabase server client with the request cookies
 * 2. Checks if the user is authenticated
 * 3. Redirects users based on authentication status and requested route
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse with appropriate redirects or the original response
 */
export async function updateSession(request: NextRequest) {
  // Special case for auth callback and logout
  if (request.nextUrl.pathname === '/auth/callback' || 
      request.nextUrl.pathname === '/logout') {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getUser() instead of getSession() for better security
  const { data: { user } } = await supabase.auth.getUser();

  // Handle route protection
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/auth');
  
  // Redirect unauthenticated users to sign in
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }
  
  // Redirect authenticated users away from auth pages
  // But allow access to logout page
  if (user && isAuthRoute && 
      path !== '/auth/callback' && 
      path !== '/auth/logout') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Special handling for root path
  if (path === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/dashboard' : '/auth/signin';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}