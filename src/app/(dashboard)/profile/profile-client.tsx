'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, UserOrganization } from '@prisma/client';
import { ProfileHeader } from './components/profile-header';
import { PersonalInfoForm } from './components/personal-info-form';
import { PasswordChangeForm } from './components/password-change-form';
import { OrganizationsList } from './components/organizations-list';
import { AccountDeletionSection } from './components/account-deletion-section';
import { toast } from 'sonner';

interface ProfileClientProps {
  user: User & {
    organizations: (UserOrganization & {
      organization: {
        id: string;
        name: string;
        slug: string;
      };
      role: {
        id: string;
        name: string;
      };
    })[];
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  
  // Add error handling for any missing user data
  useEffect(() => {
    try {
      // Check if the user object has all required properties
      if (!user) {
        console.error('User object is undefined');
        setHasError(true);
        toast.error('Error loading profile data', {
          description: 'Please try again later',
        });
        // Don't redirect immediately to avoid infinite redirect loops
        return;
      }
      
      // Log user data for debugging
      console.log('User data loaded successfully', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle,
        bio: user.bio
      });
      
    } catch (error) {
      console.error('Error in ProfileClient:', error);
      setHasError(true);
      toast.error('Error loading profile data', {
        description: 'Please try again later',
      });
    }
  }, [user, router]);
  
  // If there's an error, show a simple error UI instead of redirecting
  if (hasError) {
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
            <p className="mb-4">This could be due to one of the following reasons:</p>
            <ul className="list-disc ml-5 space-y-2">
              <li>Your session has expired</li>
              <li>There&apos;s an issue with your account data</li>
              <li>The server is currently experiencing problems</li>
            </ul>
            <div className="mt-6">
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Return to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Separator />
      
      <ProfileHeader 
        name={user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Organizations</CardTitle>
              <CardDescription>
                Organizations you belong to and your roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationsList organizations={user.organizations} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Manage your account settings and data
              </CardDescription>
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