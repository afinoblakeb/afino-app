import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/utils/database/prisma';
import { randomUUID } from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params before accessing its properties in Next.js 15+
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Organization slug is required' },
        { status: 400 }
      );
    }
    
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
    
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { slug },
    });
    
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
    
    // Check if user already has a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: user.email || '',
        organizationId: organization.id,
        status: 'PENDING',
      },
    });
    
    if (existingInvitation) {
      return NextResponse.json(
        { error: 'You already have a pending invitation to this organization' },
        { status: 400 }
      );
    }
    
    // Find the member role for this organization
    const memberRole = await prisma.role.findFirst({
      where: {
        organizationId: organization.id,
        name: 'Member', // Assuming there's a standard 'Member' role
      },
    });
    
    if (!memberRole) {
      return NextResponse.json(
        { error: 'Default role not found for this organization' },
        { status: 500 }
      );
    }
    
    // Create a membership request (using the invitation model)
    const membershipRequest = await prisma.invitation.create({
      data: {
        email: user.email || '',
        token: randomUUID(),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        organization: {
          connect: { id: organization.id },
        },
        role: {
          connect: { id: memberRole.id },
        },
        invitedBy: {
          connect: { id: user.id },
        },
      },
    });
    
    // TODO: Notify organization admins about the request
    
    return NextResponse.json({
      message: 'Access request sent successfully',
      requestId: membershipRequest.id,
    });
  } catch (error) {
    console.error('Error requesting organization access:', error);
    return NextResponse.json(
      { error: 'Failed to request organization access' },
      { status: 500 }
    );
  }
} 