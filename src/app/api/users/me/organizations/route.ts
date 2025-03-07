import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserOrganizations } from '@/services/organizationService';

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
    
    // Get user's organizations
    const userOrganizations = await getUserOrganizations(user.id);
    
    // Transform the data for the frontend
    const organizations = userOrganizations.map((userOrg) => ({
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
    
    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
} 