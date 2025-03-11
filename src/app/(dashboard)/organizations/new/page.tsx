import NewOrganizationForm from './new-organization-form';

// Add dynamic rendering to avoid static prerendering issues
export const dynamic = 'force-dynamic';

// Create a simpler server component that doesn't cause serialization issues
export default function NewOrganizationPage() {
  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Organization</h1>
      <NewOrganizationForm />
    </div>
  );
} 