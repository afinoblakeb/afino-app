'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Check if the URL contains a success parameter
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      
      // Redirect to sign-in page after a short delay
      const timer = setTimeout(() => {
        router.push('/auth/signin');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="text-gray-600 mt-4">Please wait while we verify your email address.</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mt-4">Email Verified!</h1>
            <p className="text-gray-600 mt-4">
              Your email has been successfully verified. You will be redirected to the sign-in page shortly.
            </p>
            <div className="mt-6">
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Click here if you are not redirected automatically
              </Link>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mt-4">Verification Failed</h1>
            <p className="text-gray-600 mt-4">
              There was an error verifying your email. The link may have expired or is invalid.
            </p>
            <div className="mt-6">
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Return to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 