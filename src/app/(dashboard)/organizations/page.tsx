import { Suspense } from 'react';
import OrganizationsClient from './organizations-client';
import { LoadingOrganizations } from './loading-organizations';

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<LoadingOrganizations />}>
      <OrganizationsClient />
    </Suspense>
  );
} 