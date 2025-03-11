import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('Session error in middleware:', sessionError)
  }

  const path = request.nextUrl.pathname
  
  // Debug information
  console.log(`[Middleware] Path: ${path}, Session exists: ${!!session}`)
  
  // Skip auth check for callback route
  if (path.startsWith('/auth/callback')) {
    return response
  }
  
  // If the user is signed in and the current path is /auth/signin or /auth/signup, redirect the user to /dashboard
  if (session && (path === '/auth/signin' || path === '/auth/signup')) {
    console.log('[Middleware] Redirecting authenticated user from auth page to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the user is not signed in and the current path is /dashboard or /profile, redirect the user to /auth/signin
  if (!session && (path === '/dashboard' || path === '/profile' || path.startsWith('/organizations'))) {
    console.log('[Middleware] Redirecting unauthenticated user to signin page')
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
} 