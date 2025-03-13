import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiSupabaseClient } from '@/utils/supabase/api-client';

/**
 * Get organizations the current user belongs to
 * @route GET /api/users/me/organizations
 */
export async function GET(request: Request) {
  try {
    // Use the API client for consistent authentication handling
    const supabase = createApiSupabaseClient(request);
    
    // Use getUser() for secure authentication verification  
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({ error: 'Authentication failed', message: userError.message }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', message: 'No authenticated user found' }, { status: 401 });
    }
    
    try {
      // Get organizations the user belongs to
      const userOrganizations = await prisma.userOrganization.findMany({
        where: { userId: user.id },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              domain: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      // Transform the data to a clean format for the client
      const organizations = userOrganizations.map(membership => ({
        id: membership.id,
        organizationId: membership.organizationId,
        organization: {
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
          domain: membership.organization.domain,
        },
        role: {
          id: membership.role.id,
          name: membership.role.name,
        },
      }));
      
      return NextResponse.json({ organizations });
    } catch {
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch organizations data' },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 