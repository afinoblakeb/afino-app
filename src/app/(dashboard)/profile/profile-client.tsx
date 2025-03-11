'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ProfileHeader } from './components/profile-header';
import { PersonalInfoForm } from './components/personal-info-form';
import { PasswordChangeForm } from './components/password-change-form';
import { OrganizationsList } from './components/organizations-list';
import { AccountDeletionSection } from './components/account-deletion-section';

// Define types for the API responses
interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  bio: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
}

interface Role {
  id: string;
  name: string;
}

interface UserOrganization {
  id: string;
  organizationId: string;
  organization: Organization;
  role: Role;
}

export default function ProfileClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);
  const fetchTimeRef = useRef<number>(0);

  // Add a visibility change event handler to prevent unnecessary reloads
  useEffect(() => {
    // Only fetch data on initial mount, not on visibility changes
    const handleVisibilityChange = () => {
      // Don't do anything on visibility change - this prevents unnecessary reloads
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // Prevent repeated fetching that can cause refreshes
    if (isMounted.current) return;
    isMounted.current = true;

    async function fetchProfileData() {
      try {
        setIsLoading(true);
        
        // Fetch user profile data
        const profileResponse = await fetch('/api/user/profile', {
          cache: 'default', // Use browser's standard cache control
        });
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Failed to fetch profile data');
        }
        const profileData = await profileResponse.json();
        setProfileData(profileData);
        
        // Fetch user organizations
        const organizationsResponse = await fetch('/api/users/me/organizations', {
          cache: 'default', // Use browser's standard cache control
        });
        
        if (!organizationsResponse.ok) {
          const errorData = await organizationsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch organizations');
        }
        const organizationsData = await organizationsResponse.json();
        setOrganizations(organizationsData.organizations);
        
        // Update the fetch time
        fetchTimeRef.current = Date.now();
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching profile data');
        toast.error('Error loading profile data', {
          description: err instanceof Error ? err.message : 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfileData();
  }, []);

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
            <p className="mb-4">{error || 'Failed to load profile data'}</p>
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
              setError(null);
              setIsLoading(true);
              isMounted.current = false;
              
              // Re-fetch data without a full page refresh
              async function refetchData() {
                try {
                  // Fetch user profile data
                  const profileResponse = await fetch('/api/user/profile', {
                    cache: 'reload', // Force a reload of the resource
                  });
                  
                  if (!profileResponse.ok) {
                    const errorData = await profileResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch profile data');
                  }
                  const profileData = await profileResponse.json();
                  setProfileData(profileData);
                  
                  // Fetch user organizations
                  const organizationsResponse = await fetch('/api/users/me/organizations', {
                    cache: 'reload', // Force a reload of the resource
                  });
                  
                  if (!organizationsResponse.ok) {
                    const errorData = await organizationsResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch organizations');
                  }
                  const organizationsData = await organizationsResponse.json();
                  setOrganizations(organizationsData.organizations);
                  
                  // Update the fetch time
                  fetchTimeRef.current = Date.now();
                } catch (err) {
                  console.error('Error fetching profile data:', err);
                  setError(err instanceof Error ? err.message : 'An error occurred while fetching profile data');
                  toast.error('Error loading profile data', {
                    description: err instanceof Error ? err.message : 'Please try again later',
                  });
                } finally {
                  setIsLoading(false);
                }
              }
              
              refetchData();
            }}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Successful state
  return (
    <div className="space-y-6 w-full max-w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Separator />
      
      <ProfileHeader 
        name={profileData.name || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || profileData.email}
        email={profileData.email}
        avatarUrl={profileData.avatarUrl}
      />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
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
              <PersonalInfoForm user={profileData} />
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
              <OrganizationsList organizations={organizations} />
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