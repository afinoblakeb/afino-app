import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets, API routes, and auth callback
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // Create a response object to modify
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the request is for a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

    // Special handling for the dashboard route with hash fragments
    if (isProtectedRoute && !session) {
      // Check if there's a hash fragment in the URL (this would happen with implicit flow)
      const url = request.url;
      if (url.includes('#access_token=')) {
        // Allow this request to proceed - the client-side code will handle the token
        return res;
      }

      // Otherwise redirect to sign in
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If accessing auth routes with a session, redirect to dashboard
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 