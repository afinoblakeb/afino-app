import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * List of public routes that don't require authentication
 */
const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/callback', '/auth/verify']

/**
 * List of routes that should completely skip middleware processing
 * CRITICAL: The auth callback must not be processed by middleware for PKCE to work
 */
const skipMiddlewareRoutes = ['/auth/callback']

/**
 * Check if a path is a public route
 */
function isPublicRoute(path: string): boolean {
  return publicRoutes.includes(path) || 
    path.startsWith('/_next') || 
    path.startsWith('/favicon.ico') ||
    path.endsWith('.svg') ||
    path.endsWith('.js') || 
    path.endsWith('.css')
}

/**
 * Check if middleware should be skipped entirely for this route
 */
function shouldSkipMiddleware(path: string): boolean {
  return skipMiddlewareRoutes.some(route => path.startsWith(route)) ||
    path.includes('_next/static') || 
    path.includes('_next/image') || 
    path.includes('favicon.ico')
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname, search } = request.nextUrl

  // Use more concise logging 
  const requestPath = `${pathname}${search || ''}`;
  console.log(`[Middleware] Processing: ${requestPath}`);
  
  // CRITICAL: Skip middleware completely for callback routes and static files
  if (shouldSkipMiddleware(pathname)) {
    console.log(`[Middleware] Skipping excluded path: ${pathname}`);
    return NextResponse.next();
  }
  
  // Check if there's a code param in the URL - this indicates an OAuth callback  
  const hasCodeParam = request.nextUrl.searchParams.has('code');
  if (hasCodeParam) {
    console.log(`[Middleware] Detected code parameter, skipping for PKCE flow`);
    return NextResponse.next();
  }
  
  // Create a response object
  const response = NextResponse.next()
  
  try {
    // Create Supabase client for auth verification
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the cookies for the request and response
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the cookies for the request and response
            request.cookies.delete(name)
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Use getUser instead of getSession for better security
    // This makes a server call to validate the authentication
    console.log(`[Middleware] Verifying authentication for: ${pathname}`);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[Middleware] Authentication error:', error.message);
    }
    
    // Log debugging information
    console.log(`[Middleware] Path: ${pathname}, User authenticated: ${!!user}`);
    
    // If the user is signed in and the current path is an auth page, redirect to dashboard
    if (user && pathname.startsWith('/auth')) {
      console.log('[Middleware] Redirecting authenticated user from auth page to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If the user is not signed in and the current path is a protected route,
    // redirect to the signin page with the return URL
    if (!user && !isPublicRoute(pathname)) {
      console.log('[Middleware] Redirecting unauthenticated user to signin page');
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error(`[Middleware] Error processing request for path ${pathname}:`, error);
    
    // If an error occurs, still allow the request to continue
    return response;
  }
}

export const config = {
  // Skip static files and API routes that don't need auth
  matcher: ['/((?!api/public|_next/static|_next/image|favicon.ico).*)'],
} 