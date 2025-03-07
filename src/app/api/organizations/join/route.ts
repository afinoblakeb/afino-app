import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getOrganizationById, addUserToOrganization, isUserInOrganization } from '@/services/organizationService';
import { getOrCreateMemberRole } from '@/services/roleService';

export async function POST(request: Request) {
  try {
    const { organizationId } = await request.json();
    
    // Validate input
    if (!organizationId || typeof organizationId !== 'string') {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the organization exists
    const organization = await getOrganizationById(organizationId);
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is already a member of the organization
    const isMember = await isUserInOrganization(user.id, organizationId);
    
    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }
    
    // Get the member role
    const memberRole = await getOrCreateMemberRole();
    
    // Add the user to the organization as a member
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