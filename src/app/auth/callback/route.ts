import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Handles the OAuth callback route for authentication.
 * This route is called by Supabase after a user completes the OAuth flow.
 * It exchanges the authorization code for a session and redirects the user
 * to the appropriate page based on the environment.
 * 
 * @param request - The incoming request object containing the authorization code
 * @returns A redirect response to either the next URL or an error page
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Redirect to error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 