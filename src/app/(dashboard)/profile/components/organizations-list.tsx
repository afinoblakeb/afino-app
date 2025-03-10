'use client';

import { UserOrganization } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface OrganizationsListProps {
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
}

export function OrganizationsList({ organizations }: OrganizationsListProps) {
  const router = useRouter();
  
  if (organizations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You are not a member of any organizations yet.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/organizations/new')}
        >
          Create Organization
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {organizations.map((membership) => (
        <div 
          key={membership.id} 
          className="flex items-center justify-between p-4 border rounded-md"
        >
          <div>
            <h3 className="font-medium">{membership.organization.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{membership.role.name}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/organizations/${membership.organization.slug}`)}
          >
            View
          </Button>
        </div>
      ))}
    </div>
  );
} 