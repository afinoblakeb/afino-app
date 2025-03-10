'use client';

import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
}

interface OrganizationDashboardClientProps {
  organization: Organization;
}

export default function OrganizationDashboardClient({ organization }: OrganizationDashboardClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
          <p className="text-muted-foreground">
            Organization Dashboard
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/organizations/${organization.slug}/settings`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage your organization members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-sm text-muted-foreground mt-2">
              Member management will be available soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>Pending invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-sm text-muted-foreground mt-2">
              Invitation management will be available soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Manage roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-sm text-muted-foreground mt-2">
              Role management will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
      
      {organization.domain && (
        <Card>
          <CardHeader>
            <CardTitle>Domain</CardTitle>
            <CardDescription>Your organization&apos;s domain</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{organization.domain}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Users with this email domain can automatically join your organization
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 