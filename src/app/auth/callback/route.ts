import { NextResponse } from 'next/server'

/**
 * Handles the OAuth callback route
 * Provides a minimal page that allows Supabase's auto-detection to handle the code exchange
 */
export async function GET(request: Request) {
  console.log('[Auth Callback] Starting callback processing')
  console.log('[Auth Callback] Full URL:', request.url)
  
  // Get the authorization code from the URL
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Log all available search params for debugging
  console.log('[Auth Callback] All URL params:')
  requestUrl.searchParams.forEach((value, key) => {
    console.log(`  ${key}: ${key === 'code' ? '**REDACTED**' : value}`)
  })
  
  // Get the next URL for redirection after authentication
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  console.log(`[Auth Callback] Code exists: ${!!code}, Next URL: ${next}`)

  // Check for errors from OAuth provider
  if (error) {
    console.error(`[Auth Callback] OAuth error: ${error}, Description: ${errorDescription}`)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(errorDescription || error)}`
    )
  }
  
  // If no code is provided, redirect to sign-in with an error message
  if (!code) {
    console.log('[Auth Callback] No code provided, redirecting to sign-in')
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=${encodeURIComponent('No authentication code provided')}`
    )
  }

  // Create a minimal page with the auth code intact in the URL
  // Supabase's auto-detection (detectSessionInUrl) will handle the code exchange
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Completing authentication...</title>
      <script>
        console.log('[Auth Callback Page] Initializing callback handling');
        
        try {
          // Preserve the original URL parameters with the code
          const currentUrl = new URL(window.location.href);
          const code = currentUrl.searchParams.get('code');
          const nextUrl = '${requestUrl.origin}${next}';
          const targetUrl = new URL(nextUrl);
          
          // Pass the code to the destination URL
          if (code) {
            targetUrl.searchParams.set('code', code);
            console.log('[Auth Callback Page] Code parameter will be preserved in redirect');
          }
          
          console.log('[Auth Callback Page] Redirecting to:', targetUrl.toString());
          // Redirect immediately - no need for delay
          window.location.href = targetUrl.toString();
        } catch (error) {
          console.error('[Auth Callback Page] Error during callback handling:', error);
          // In case of error, still try to redirect to the destination
          window.location.href = '${requestUrl.origin}${next}';
        }
      </script>
    </head>
    <body>
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
        <h1 style="font-family: sans-serif; color: #333;">Completing authentication...</h1>
        <p style="font-family: sans-serif; color: #666;">Please wait, you will be redirected shortly.</p>
      </div>
    </body>
  </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 