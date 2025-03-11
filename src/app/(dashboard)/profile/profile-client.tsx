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

  // DISABLED: Visibility change event handler - completely disabled to prevent reloads
  // useEffect(() => {
  //   // Only fetch data on initial mount, not on visibility changes
  //   const handleVisibilityChange = () => {
  //     // Don't do anything on visibility change - this prevents unnecessary reloads
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
    
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);

  useEffect(() => {
    console.log('[ProfileClient] Initial data fetch useEffect triggered');
    
    // EMERGENCY FIX: Implement a throttle using localStorage to prevent repeated API calls
    const lastFetchTime = localStorage.getItem('lastProfileFetch');
    const now = Date.now();
    
    // If we've fetched within the last 10 seconds, don't fetch again
    if (lastFetchTime && now - parseInt(lastFetchTime) < 10000) {
      console.log('[ProfileClient] Skipping fetch - too recent (within 10s)');
      
      // Try to use cached data if available
      const cachedProfile = localStorage.getItem('cachedProfile');
      const cachedOrgs = localStorage.getItem('cachedOrganizations');
      
      if (cachedProfile && cachedOrgs) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          const parsedOrgs = JSON.parse(cachedOrgs);
          
          console.log('[ProfileClient] Using cached data - profile and', parsedOrgs.length, 'organizations');
          setProfileData(parsedProfile);
          setOrganizations(parsedOrgs);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('[ProfileClient] Error parsing cached data:', e);
        }
      }
      
      return;
    }
    
    // Prevent repeated fetching that can cause refreshes
    if (isMounted.current) {
      console.log('[ProfileClient] Already mounted, skipping fetch');
      return;
    }
    isMounted.current = true;

    async function fetchProfileData() {
      console.log('[ProfileClient] Fetching profile data...');
      try {
        setIsLoading(true);
        
        // Fetch user profile data
        console.log('[ProfileClient] Fetching user profile...');
        const profileResponse = await fetch('/api/user/profile', {
          cache: 'default', // Use browser's standard cache control
        });
        
        if (!profileResponse.ok) {
          console.error('[ProfileClient] Failed to fetch profile data:', profileResponse.status);
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Failed to fetch profile data');
        }
        const profileData = await profileResponse.json();
        console.log('[ProfileClient] Profile data fetched successfully');
        setProfileData(profileData);
        
        // Cache the profile data
        localStorage.setItem('cachedProfile', JSON.stringify(profileData));
        
        // Fetch user organizations
        console.log('[ProfileClient] Fetching user organizations...');
        const organizationsResponse = await fetch('/api/users/me/organizations', {
          cache: 'default', // Use browser's standard cache control
        });
        
        if (!organizationsResponse.ok) {
          console.error('[ProfileClient] Failed to fetch organizations:', organizationsResponse.status);
          const errorData = await organizationsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch organizations');
        }
        const organizationsData = await organizationsResponse.json();
        console.log('[ProfileClient] Organizations fetched successfully:', organizationsData.organizations?.length || 0);
        setOrganizations(organizationsData.organizations);
        
        // Cache the organizations data
        localStorage.setItem('cachedOrganizations', JSON.stringify(organizationsData.organizations));
        localStorage.setItem('lastProfileFetch', now.toString());
        
        // Update the fetch time
        fetchTimeRef.current = Date.now();
      } catch (err) {
        console.error('[ProfileClient] Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching profile data');
        toast.error('Error loading profile data', {
          description: err instanceof Error ? err.message : 'Please try again later',
        });
      } finally {
        setIsLoading(false);
        console.log('[ProfileClient] Fetch completed');
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
              console.log('[ProfileClient] Try Again button clicked');
              setError(null);
              setIsLoading(true);
              isMounted.current = false;
              
              // Re-fetch data without a full page refresh
              async function refetchData() {
                console.log('[ProfileClient] Refetching data...');
                
                // Force a refresh by clearing the cache timestamps
                localStorage.removeItem('lastProfileFetch');
                localStorage.removeItem('lastOrganizationsFetch');
                
                try {
                  // Fetch user profile data
                  console.log('[ProfileClient] Refetching user profile...');
                  const profileResponse = await fetch('/api/user/profile', {
                    cache: 'reload', // Force a reload of the resource
                  });
                  
                  if (!profileResponse.ok) {
                    console.error('[ProfileClient] Failed to refetch profile data:', profileResponse.status);
                    const errorData = await profileResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch profile data');
                  }
                  const profileData = await profileResponse.json();
                  console.log('[ProfileClient] Profile data refetched successfully');
                  setProfileData(profileData);
                  
                  // Cache the profile data
                  localStorage.setItem('cachedProfile', JSON.stringify(profileData));
                  
                  // Fetch user organizations
                  console.log('[ProfileClient] Refetching user organizations...');
                  const organizationsResponse = await fetch('/api/users/me/organizations', {
                    cache: 'reload', // Force a reload of the resource
                  });
                  
                  if (!organizationsResponse.ok) {
                    console.error('[ProfileClient] Failed to refetch organizations:', organizationsResponse.status);
                    const errorData = await organizationsResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch organizations');
                  }
                  const organizationsData = await organizationsResponse.json();
                  console.log('[ProfileClient] Organizations refetched successfully:', organizationsData.organizations?.length || 0);
                  setOrganizations(organizationsData.organizations);
                  
                  // Cache the organizations data
                  localStorage.setItem('cachedOrganizations', JSON.stringify(organizationsData.organizations));
                  localStorage.setItem('lastProfileFetch', Date.now().toString());
                  localStorage.setItem('lastOrganizationsFetch', Date.now().toString());
                  
                  // Update the fetch time
                  fetchTimeRef.current = Date.now();
                } catch (err) {
                  console.error('[ProfileClient] Error refetching profile data:', err);
                  setError(err instanceof Error ? err.message : 'An error occurred while fetching profile data');
                  toast.error('Error loading profile data', {
                    description: err instanceof Error ? err.message : 'Please try again later',
                  });
                } finally {
                  setIsLoading(false);
                  console.log('[ProfileClient] Refetch completed');
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