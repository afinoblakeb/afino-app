'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PersonalInfoForm } from './components/personal-info-form';
import { PasswordChangeForm } from './components/password-change-form';
import { OrganizationsList } from './components/organizations-list';
import { AccountDeletionSection } from './components/account-deletion-section';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';

// Define interface for the component that matches the PersonalInfoForm requirements
interface FormUserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  bio: string | null;
}

interface UserOrganization {
  id: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
  };
  role: {
    id: string;
    name: string;
  };
}

export default function ProfileClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const { user } = useAuth();

  // Fetch profile data using React Query
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useUserProfile(!!user);

  // Only fetch organizations if we have a profile
  const { 
    data: organizationsData, 
    isLoading: isOrgsLoading,
    error: orgsError,
    refetch: refetchOrganizations
  } = useOrganizations(profileData?.id);

  const isLoading = isProfileLoading || isOrgsLoading;
  const error = profileError || orgsError;

  const organizations = organizationsData || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile data...</p>
      </div>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Profile</CardTitle>
            <CardDescription>
              There was a problem loading your profile data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error instanceof Error ? error.message : 'Failed to load profile data'}</p>
            <p className="mb-4">This could be due to one of the following reasons:</p>
            <ul className="list-disc ml-5 space-y-2">
              <li>Your session has expired</li>
              <li>There&apos;s an issue with your account data</li>
              <li>The server is currently experiencing problems</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button onClick={() => {
              console.log('[ProfileClient] Try Again button clicked');
              
              // Use React Query refetch to reload data
              refetchProfile();
              if (profileData?.id) {
                refetchOrganizations();
              }
              
              toast.info('Refreshing your profile data...');
            }}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Transform API response to match component props
  const formattedUserProfile: FormUserProfile = {
    id: profileData.id || '',
    email: profileData.email || '',
    name: profileData.name || null,
    firstName: null, // Assuming these are set in the component
    lastName: null,
    avatarUrl: profileData.avatar_url || null,
    jobTitle: null,
    bio: null
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      <p className="text-muted-foreground">Manage your account settings and preferences</p>
      
      <Separator />
      
      <div className="flex items-center">
        <div className="flex items-center space-x-4">
          {profileData.avatar_url ? (
            <div className="h-12 w-12 rounded-full overflow-hidden relative">
              <Image 
                src={profileData.avatar_url}
                alt={profileData.name || 'User avatar'}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center text-lg font-medium">
              {profileData.name?.charAt(0) || (profileData.email ? profileData.email.charAt(0) : 'U')}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{profileData.name || profileData.email}</h2>
            {profileData.email && <p className="text-sm text-muted-foreground">{profileData.email}</p>}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm user={formattedUserProfile} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Organizations</CardTitle>
              <CardDescription>Organizations you belong to and your roles</CardDescription>
            </CardHeader>
            <CardContent>
              {organizations.length > 0 ? (
                <OrganizationsList 
                  organizations={organizations.map(org => ({
                    id: org.id || '',
                    organizationId: org.id || '',
                    organization: {
                      id: org.id || '',
                      name: org.name || '',
                      slug: org.slug || '',
                      domain: org.domain || null
                    },
                    role: {
                      id: '1',
                      name: org.role || 'Member'
                    }
                  })) as UserOrganization[]}
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You are not a member of any organizations.</p>
                  <Button onClick={() => router.push('/organizations/new')}>
                    Create an Organization
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
          
          <Separator className="my-6" />
          
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings and data</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountDeletionSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 