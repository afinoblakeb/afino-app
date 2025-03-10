'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, UserOrganization } from '@prisma/client';
import { ProfileHeader } from './components/profile-header';
import { PersonalInfoForm } from './components/personal-info-form';
import { PasswordChangeForm } from './components/password-change-form';
import { OrganizationsList } from './components/organizations-list';
import { AccountDeletionSection } from './components/account-deletion-section';

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