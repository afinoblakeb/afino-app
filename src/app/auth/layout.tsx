import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">Afino</span>
            </Link>
          </div>
          
          {children}
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex h-full items-center justify-center p-12">
            <div className="max-w-lg text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Welcome to Afino
              </h2>
              <p className="text-xl text-white/90">
                The modern platform for organization management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 