'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { InviteUserForm } from '@/components/organizations/InviteUserForm';
import { InvitationsList } from '@/components/organizations/InvitationsList';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
}

interface Role {
  id: string;
  name: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
  invitedBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface OrganizationDashboardClientProps {
  organization: Organization;
}

export default function OrganizationDashboardClient({ organization }: OrganizationDashboardClientProps) {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organizations/${organization.slug}/invitations`);
      
      if (!response.ok) {
        console.error('Failed to load invitations');
        return;
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/organizations/${organization.slug}/roles`);
      
      if (!response.ok) {
        // Fallback to default roles if API doesn't exist yet
        setRoles([
          { id: 'admin', name: 'Admin' },
          { id: 'member', name: 'Member' },
        ]);
        return;
      }
      
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      // Fallback to default roles
      setRoles([
        { id: 'admin', name: 'Admin' },
        { id: 'member', name: 'Member' },
      ]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRoles();
    fetchInvitations();
  }, [organization.slug]);

  // Handler for when invitation is sent
  const handleInvitationSent = () => {
    setInviteSheetOpen(false);
    fetchInvitations();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
          <p className="text-muted-foreground">
            Organization Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Invite User</SheetTitle>
                <SheetDescription>
                  Invite a user to join your organization.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <InviteUserForm
                  organizationSlug={organization.slug}
                  roles={roles}
                  onSuccess={handleInvitationSent}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            onClick={() => router.push(`/organizations/${organization.slug}/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
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
            <p className="text-2xl font-bold">{invitations.filter(i => i.status === 'pending').length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {invitations.filter(i => i.status === 'pending').length === 0 
                ? 'No pending invitations' 
                : 'Users awaiting response to join'}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => router.push(`/organizations/${organization.slug}/invitations`)}
            >
              Manage Invitations
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Manage roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{roles.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Role management will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Manage pending invitations to your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationsList 
            organizationSlug={organization.slug} 
            invitations={invitations}
            onUpdate={fetchInvitations}
          />
        </CardContent>
      </Card>
      
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