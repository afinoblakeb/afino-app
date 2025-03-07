import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    // Get the cookies from the request - must be awaited
    const cookieStore = await cookies()
    
    // Create a Supabase client with the cookies API
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Get the cookie value from the cookie store
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Set the cookie value in the cookie store
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // This can happen in middleware where cookies are readonly
            }
          },
          remove(name: string, options: CookieOptions) {
            // Remove the cookie from the cookie store
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 })
            } catch {
              // This can happen in middleware where cookies are readonly
            }
          },
        },
      }
    )

    try {
      // Must await the exchange code for session
      await supabase.auth.exchangeCodeForSession(code)
    } catch {
      // If there's an error, redirect to the sign-in page
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=Could not authenticate user`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
} 