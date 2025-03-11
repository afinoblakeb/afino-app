import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Get organizations the current user belongs to
export async function GET() {
  try {
    // Get the user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Use getUser() instead of getSession() to avoid warning
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
} 