import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | Afino',
  description: 'Sign in to your Afino account',
};

export default function SignInPage() {
  return (
    <div className="min-h-full flex items-center justify-center">
      <SignInForm />
    </div>
  );
} 