import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    // No code provided, redirect to sign-in
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=No authentication code provided`)
  }

  // Instead of redirecting immediately, return an HTML page with JavaScript that will:
  // 1. Wait for the Supabase client to process the code
  // 2. Check for a session
  // 3. Redirect to the dashboard only when the session is confirmed
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authenticating...</title>
        <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
        <script>
          // Function to create a Supabase client
          function createClient() {
            return supabase.createClient(
              '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
              '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
            )
          }
          
          // Process the authentication and redirect
          async function processAuth() {
            try {
              // Create the Supabase client
              const supabase = createClient()
              
              // The code is in the URL, Supabase will automatically exchange it
              // Wait a moment for the client to initialize
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Check if we have a session
              const { data, error } = await supabase.auth.getSession()
              
              if (error) {
                console.error('Error getting session:', error)
                window.location.href = '/auth/signin?error=' + encodeURIComponent(error.message)
                return
              }
              
              if (data.session) {
                console.log('Session established successfully')
                // Redirect to the dashboard
                window.location.href = '${next}'
              } else {
                console.error('No session established')
                window.location.href = '/auth/signin?error=Authentication failed'
              }
            } catch (error) {
              console.error('Unexpected error:', error)
              window.location.href = '/auth/signin?error=Authentication failed'
            }
          }
          
          // Start the process when the page loads
          window.onload = processAuth
        </script>
      </head>
      <body>
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
          <h1 style="font-family: sans-serif; color: #333;">Completing authentication...</h1>
          <p style="font-family: sans-serif; color: #666;">Please wait, you will be redirected shortly.</p>
        </div>
      </body>
    </html>
  `
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
} 