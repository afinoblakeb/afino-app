import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the organization ID
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
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
      where: { id },
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
        organizationId: id,
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
        email: user.email,
        organizationId: id,
        status: 'PENDING',
      },
    });
    
    if (existingInvitation) {
      return NextResponse.json(
        { error: 'You already have a pending invitation to this organization' },
        { status: 400 }
      );
    }
    
    // Create a membership request (using the invitation model with type = 'REQUEST')
    const request = await prisma.invitation.create({
      data: {
        email: user.email,
        type: 'REQUEST',
        status: 'PENDING',
        organization: {
          connect: { id },
        },
        invitedBy: {
          connect: { id: user.id },
        },
        // Use a default member role ID (assuming 2 is the member role ID)
        roleId: '2',
      },
    });
    
    // TODO: Notify organization admins about the request
    
    return NextResponse.json({
      message: 'Access request sent successfully',
      requestId: request.id,
    });
  } catch (error) {
    console.error('Error requesting organization access:', error);
    return NextResponse.json(
      { error: 'Failed to request organization access' },
      { status: 500 }
    );
  }
} 