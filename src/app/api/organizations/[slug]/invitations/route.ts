import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-server-session';
import { createInvitation, getOrganizationInvitations } from '@/services/invitationService';
import { getOrganizationBySlug } from '@/services/organizationService';
import { getOrCreateMemberRoleForOrganization } from '@/services/roleService';

// Schema for invitation creation request
const inviteUserSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  roleId: z.string().optional(),
});

// Get all invitations for an organization
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { slug } = await params;
    
    // Get the organization
    const organization = await getOrganizationBySlug(slug);
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Check if the user is an admin of the organization
    const isAdmin = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organization.id,
        role: {
          name: 'Admin',
        },
      },
    });
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get all invitations for the organization
    const invitations = await getOrganizationInvitations(organization.id);
    
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error getting invitations:', error);
    return NextResponse.json(
      { error: 'Failed to get invitations' },
      { status: 500 }
    );
  }
}

// Create a new invitation
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { slug } = await params;
    
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = inviteUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { email, roleId } = validationResult.data;
    
    // Get the organization
    const organization = await getOrganizationBySlug(slug);
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Check if the user is an admin of the organization
    const isAdmin = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organization.id,
        role: {
          name: 'Admin',
        },
      },
    });
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if the user is already a member of the organization
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: { organizationId: organization.id },
        },
      },
    });
    
    if (existingUser && existingUser.organizations.length > 0) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }
    
    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId: organization.id,
        status: 'pending',
      },
    });
    
    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }
    
    // Determine the role ID to use
    let finalRoleId = roleId;
    if (!finalRoleId) {
      // Use the default member role if no role is specified
      const memberRole = await getOrCreateMemberRoleForOrganization(organization.id);
      finalRoleId = memberRole.id;
    }
    
    // Create the invitation
    const invitation = await createInvitation({
      email,
      organizationId: organization.id,
      roleId: finalRoleId,
      invitedById: session.user.id,
    });
    
    // TODO: Send invitation email
    
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
} 