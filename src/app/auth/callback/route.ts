import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    // No code provided, redirect to sign-in
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=No authentication code provided`)
  }

  try {
    // Create a response that will redirect to the dashboard
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`)
    
    // We don't need to manually set cookies or exchange the code here
    // The Supabase client in the browser will handle this automatically
    // Just return the response with the redirect
    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    // If there's an error, redirect to the sign-in page
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=Could not authenticate user`)
  }
} 