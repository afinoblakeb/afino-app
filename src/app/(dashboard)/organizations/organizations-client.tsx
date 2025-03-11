'use client';

import { UserOrganization } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { PlusCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface OrganizationsClientProps {
  userOrganizations: (UserOrganization & {
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
}

export default function OrganizationsClient({ userOrganizations }: OrganizationsClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            View and manage your organization memberships
          </p>
        </div>
        <Button onClick={() => router.push('/organizations/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>
      
      <Separator />
      
      {userOrganizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Organizations Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You don&apos;t belong to any organizations yet. Create your first organization to get started.
          </p>
          <Button onClick={() => router.push('/organizations/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userOrganizations.map((membership) => (
            <Card key={membership.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{membership.organization.name}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-1">
                    {membership.role.name}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  slug: {membership.organization.slug}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push(`/organizations/${membership.organization.slug}/settings`)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  onClick={() => router.push(`/organizations/${membership.organization.slug}`)}
                >
                  View Dashboard
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 