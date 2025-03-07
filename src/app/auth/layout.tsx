import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Auth form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/afino-logo.svg" 
                alt="Afino Logo" 
                width={120} 
                height={40} 
                priority
              />
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
              <div className="flex justify-center mb-6">
                <Image 
                  src="/afino-logo.svg" 
                  alt="Afino Logo" 
                  width={180} 
                  height={60} 
                  className="invert" 
                  priority
                />
              </div>
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