import JoinOrganizationClient from './join-organization-client';

// Add dynamic rendering to avoid static prerendering issues
export const dynamic = 'force-dynamic';

export default function JoinOrganizationPage() {
  return (
    <div className="space-y-6 w-full max-w-lg mx-auto py-8">
      <JoinOrganizationClient />
    </div>
  );
} 