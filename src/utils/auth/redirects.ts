/**
 * Utility functions for handling authentication redirects
 * Provides dynamic redirect URL generation based on the current environment
 */

/**
 * Get the base URL for the current environment
 * Uses environment variables in production and window.location.origin in the browser
 */
export function getBaseUrl(): string {
  // For server-side rendering or build time
  if (typeof window === 'undefined') {
    // Use environment variables for production
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      console.log('[redirects] Using NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    
    // Fallback to Vercel environment variables
    if (process.env.VERCEL_URL) {
      console.log('[redirects] Using VERCEL_URL:', `https://${process.env.VERCEL_URL}`);
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Default to localhost in development
    console.log('[redirects] Using default localhost URL');
    return 'http://localhost:3000';
  }
  
  // For client-side rendering, use the current origin
  console.log('[redirects] Using window.location.origin:', window.location.origin);
  return window.location.origin;
}

/**
 * Generate a full redirect URL for authentication
 * @param path - The path to redirect to (e.g., '/auth/callback')
 * @param params - Optional query parameters to include
 */
export function getRedirectUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);
  
  // Add query parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  console.log('[redirects] Generated redirect URL:', url.toString());
  return url.toString();
}

/**
 * Generate a callback URL specifically for OAuth providers
 * @param nextPath - The path to redirect to after authentication (e.g., '/dashboard')
 * @returns A clean callback URL without query parameters for OAuth providers
 */
export function getAuthCallbackUrl(nextPath: string = '/dashboard'): string {
  // Store the nextPath in customStorageAdapter so we can retrieve it after the callback
  if (typeof window !== 'undefined') {
    console.log('[redirects] Storing nextPath in customStorageAdapter:', nextPath);
    try {
      localStorage.setItem('auth_next_path', nextPath);
    } catch (e) {
      console.error('[redirects] Failed to store nextPath in customStorageAdapter:', e);
    }
  }
  
  // For OAuth providers, we need a clean URL without query parameters
  // This ensures the redirect_uri matches exactly what's registered in the OAuth provider
  if (typeof window !== 'undefined') {
    // In the browser, always use the current origin with the callback path
    const callbackUrl = `${window.location.origin}/auth/callback`;
    console.log('[redirects] Using clean callback URL from window.location.origin:', callbackUrl);
    return callbackUrl;
  }
  
  // Use the environment variable if available
  if (process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL) {
    console.log('[redirects] Using NEXT_PUBLIC_AUTH_REDIRECT_URL:', process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL);
    return process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL;
  }
  
  // Return a clean callback URL without query parameters
  const baseUrl = getBaseUrl();
  const callbackUrl = `${baseUrl}/auth/callback`;
  console.log('[redirects] Generated clean callback URL for OAuth:', callbackUrl);
  return callbackUrl;
} 