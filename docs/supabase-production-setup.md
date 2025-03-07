# Supabase Production Setup Guide

To ensure that authentication works correctly in production, you need to configure your Supabase project to accept redirects from your production domain.

## Configure Redirect URLs in Supabase

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (sjclvcrtuqtdwtupizxd)
3. Navigate to **Authentication** > **URL Configuration**
4. Under **Redirect URLs**, add your production URL:
   - Add `https://afino-app.vercel.app/auth/callback` as a redirect URL
   - Make sure `http://localhost:3000/auth/callback` is also there for local development

## Verify Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/)
2. Select the afino-app project
3. Navigate to **Settings** > **Environment Variables**
4. Verify that the following environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`: https://sjclvcrtuqtdwtupizxd.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [your anon key]

## Testing the Production Setup

1. Visit your production site at https://afino-app.vercel.app/auth/signin
2. Try to sign in with Google
3. After authentication, you should be redirected to https://afino-app.vercel.app/dashboard
4. If you're redirected to localhost, it means the Supabase redirect URLs are not configured correctly

## Troubleshooting

If you're still having issues with redirects:

1. **Check Browser Console**: Look for any errors in the browser console
2. **Check Supabase Logs**: Go to Supabase Dashboard > Authentication > Logs to see if there are any authentication errors
3. **Verify Callback Route**: Make sure the callback route is correctly handling the code exchange
4. **Clear Browser Cookies**: Sometimes old cookies can cause issues with authentication

## Additional Configuration

For a more secure setup, consider:

1. **Setting Up Custom Domains**: Configure a custom domain for your Supabase project
2. **Enabling MFA**: Add multi-factor authentication for additional security
3. **Configuring Email Templates**: Customize the email templates for password reset, etc. 