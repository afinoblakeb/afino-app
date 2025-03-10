import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserOrganizations } from '@/services/organizationService';

// Define a type for the user organization with its relations
interface UserOrgWithRelations {
  organization: {
    id: string;
    name: string;
    domain: string | null;
  };
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  createdAt: Date;
}

export async function GET() {
  try {
    // Get the current user
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user organizations
    const organizations = await getUserOrganizations(user.id);
    
    // Transform the data for the frontend
    const transformedOrganizations = organizations.map((userOrg: UserOrgWithRelations) => ({
      id: userOrg.organization.id,
      name: userOrg.organization.name,
      domain: userOrg.organization.domain,
      role: {
        id: userOrg.role.id,
        name: userOrg.role.name,
        permissions: userOrg.role.permissions,
      },
      joinedAt: userOrg.createdAt,
    }));
    
    return NextResponse.json({ organizations: transformedOrganizations });
  } catch (error) {
    console.error('Error getting user organizations:', error);
    return NextResponse.json(
      { error: 'Failed to get user organizations' },
      { status: 500 }
    );
  }
} 