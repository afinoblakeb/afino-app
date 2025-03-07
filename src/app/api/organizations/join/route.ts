import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { addUserToOrganization, getOrganizationById } from '@/services/organizationService';
import { getOrCreateMemberRoleForOrganization } from '@/services/roleService';

export async function POST(request: Request) {
  try {
    const { organizationId } = await request.json();
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify the organization exists
    const organization = await getOrganizationById(organizationId);
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Get member role for this organization
    const memberRole = await getOrCreateMemberRoleForOrganization(organizationId);
    
    // Add user to organization as member
    await addUserToOrganization(user.id, organizationId, memberRole.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
} 