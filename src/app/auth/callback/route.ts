import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createUserProfile } from '@/services/userService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    // Get the cookies from the request
    const cookieStore = cookies()
    
    // Create a Supabase client with the latest approach
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: true, // We need this for the code exchange
          detectSessionInUrl: true, // We need this for the code exchange
        },
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    )

    try {
      // Must await the exchange code for session
      await supabase.auth.exchangeCodeForSession(code)
      
      // Get the user from Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
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
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      // If there's an error, redirect to the sign-in page
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=Could not authenticate user`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
} 