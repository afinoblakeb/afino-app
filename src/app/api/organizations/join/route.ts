import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

import { addUserToOrganization, getOrganizationById } from '@/services/organizationService';
import { getOrCreateMemberRoleForOrganization } from '@/services/roleService';

/**
 * Join an organization
 * Adds the current user to the specified organization with member role
 * @route POST /api/organizations/join
 */
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
    const supabase = createClient();
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
} 