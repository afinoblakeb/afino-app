import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

// Explicitly mark this layout as dynamic to prevent static prerendering
export const dynamic = 'force-dynamic';

// Disable static generation for this layout
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Afino - Organization Management Platform',
  description: 'A modern platform for organization management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use 'use client' directives only in the component files, not the layout
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Ensure provider serialization with explicit dynamic rendering */}
        <QueryProvider>
          <AuthProvider>
            {/* Apply the children within the providers */}
            {children}
          </AuthProvider>
        </QueryProvider>
        {/* Add the toast notification component outside the provider hierarchy */}
        <Toaster />
      </body>
    </html>
  );
}
