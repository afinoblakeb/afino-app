import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { domain: string } }
) {
  try {
    // Get the domain/slug parameter
    const { domain } = params;
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain or slug is required' },
        { status: 400 }
      );
    }
    
    // Get the user session to verify authentication
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
    
    // Try to find organization by domain first
    let organization = await prisma.organization.findFirst({
      where: {
        domain: domain,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
      },
    });
    
    // If not found by domain, try by slug
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: {
          slug: domain,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
        },
      });
    }
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member
    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organization.id,
      },
    });
    
    if (membership) {
      return NextResponse.json(
        { error: 'You are already a member of this organization' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error finding organization by domain:', error);
    return NextResponse.json(
      { error: 'Failed to find organization' },
      { status: 500 }
    );
  }
} 