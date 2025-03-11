import { Suspense } from 'react';
import ProfileClient from './profile-client';
import { LoadingProfile } from './components/loading-profile';

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingProfile />}>
      <ProfileClient />
    </Suspense>
  );
} 