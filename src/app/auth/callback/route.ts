import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createUserProfile } from '@/services/userService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    // Extract cookies from the request headers directly
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Create a Supabase client with the latest approach
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true, // We need this for the code exchange
          detectSessionInUrl: true, // We need this for the code exchange
        },
        global: {
          headers: {
            cookie: cookieHeader,
          },
        },
      }
    )

    try {
      // Exchange the code for a session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=Authentication failed`)
      }
      
      if (!sessionData.session) {
        console.error('No session returned from code exchange')
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=No session established`)
      }
      
      // Get the user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User retrieval error:', userError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=User not found`)
      }
      
      // Create a response that will redirect to the dashboard
      const response = NextResponse.redirect(`${requestUrl.origin}${next}`)
      
      // Set auth cookies in the response
      response.cookies.set('sb-access-token', sessionData.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      
      response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      
      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      })
      
      if (!existingUser) {
        // New user - create profile
        await createUserProfile(user)
        
        // Redirect to onboarding flow
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
      }
      
      // Return the response with cookies set
      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      // If there's an error, redirect to the sign-in page
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=Could not authenticate user`)
    }
  }

  // No code provided, redirect to sign-in
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=No authentication code provided`)
} 