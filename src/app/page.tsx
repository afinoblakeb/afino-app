import Link from 'next/link';

// Add dynamic rendering to avoid static prerendering issues
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="rounded-lg shadow-lg p-8 max-w-md w-full bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Afino</h1>
          <p className="text-gray-600 mb-6">
            Your collaborative workspace for teams
          </p>
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
