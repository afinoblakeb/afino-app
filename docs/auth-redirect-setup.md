# Authentication Redirect URL Setup

This document explains how to set up dynamic redirect URLs for authentication in the Afino app, allowing the application to work seamlessly between local development and production environments.

## Overview

The application now uses a dynamic redirect URL system that automatically determines the correct base URL based on the current environment. This eliminates the need to manually update redirect URLs in Supabase when switching between environments.

## Environment Variables

### Local Development

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://sjclvcrtuqtdwtupizxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL for local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Environment (Vercel)

In your Vercel project settings, add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://sjclvcrtuqtdwtupizxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://afino-app.vercel.app
```

## Supabase Configuration

In your Supabase project settings, you need to whitelist both your local and production redirect URLs:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **URL Configuration**
4. Under **Redirect URLs**, add both:
   - `http://localhost:3000/auth/callback`
   - `https://afino-app.vercel.app/auth/callback`

## How It Works

The application uses a utility function (`getBaseUrl()`) that determines the correct base URL based on the environment:

1. In server-side rendering or during build time, it uses:
   - `NEXT_PUBLIC_SITE_URL` if available
   - `VERCEL_URL` as a fallback for Vercel deployments
   - `http://localhost:3000` as a default for local development

2. In client-side rendering, it uses `window.location.origin`

This ensures that the correct redirect URL is always used, regardless of the environment.

## Testing

To test that your setup is working correctly:

1. **Local Development**:
   - Run the application locally with `npm run dev`
   - Try signing in with Google
   - After authentication, you should be redirected back to your local application

2. **Production**:
   - Deploy the application to Vercel
   - Visit your production site
   - Try signing in with Google
   - After authentication, you should be redirected back to your production application

## Troubleshooting

If you encounter issues with redirects:

1. **Check Console Logs**: Look for any errors in the browser console
2. **Verify Environment Variables**: Make sure the environment variables are set correctly
3. **Check Supabase Settings**: Verify that both redirect URLs are whitelisted in Supabase
4. **Clear Browser Cookies**: Sometimes old cookies can cause issues with authentication 