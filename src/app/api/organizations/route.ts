import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createOrganization } from '@/services/organizationService';
import { getOrCreateAdminRole } from '@/services/roleService';
import { addUserToOrganization } from '@/services/organizationService';
import { extractDomain } from '@/utils/domainUtils';

export async function POST(request: Request) {
  try {
    const { name, domain } = await request.json();
    
    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Organization name is required' },
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
    
    // If domain is not provided, extract it from the user's email
    const orgDomain = domain || (user.email ? extractDomain(user.email) : null);
    
    // Create the organization
    const organization = await createOrganization(name, orgDomain);
    
    // Get the admin role
    const adminRole = await getOrCreateAdminRole();
    
    // Add the user to the organization as an admin
    await addUserToOrganization(user.id, organization.id, adminRole.id);
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
} 