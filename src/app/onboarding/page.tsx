import OnboardingClient from './onboarding-client';

// Add dynamic rendering to avoid static prerendering issues
export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  return (
    <div className="container max-w-md py-12">
      <OnboardingClient />
    </div>
  );
} 