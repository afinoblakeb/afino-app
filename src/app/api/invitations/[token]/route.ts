import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateInvitationToken, updateInvitationStatus } from '@/services/invitationService';
import { addUserToOrganization } from '@/services/organizationService';
import { prisma } from '@/utils/database/prisma';
import { Invitation, Organization, Role, User } from '@prisma/client';

// Define a type for the invitation with includes
type InvitationWithRelations = Invitation & {
  organization: Organization;
  role: Role;
  invitedBy: User | null;
};

// Get invitation details using token
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Validate the invitation token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Get the full invitation with relations
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
        role: true,
        invitedBy: true,
      },
    }) as InvitationWithRelations | null;
    
    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Return the invitation details
    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          slug: invitation.organization.slug,
        },
        role: {
          id: invitation.role.id,
          name: invitation.role.name,
        },
        invitedBy: invitation.invitedBy ? {
          id: invitation.invitedBy.id,
          name: invitation.invitedBy.name,
        } : null,
        expiresAt: invitation.expiresAt,
      }
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}

// Accept an invitation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Check authentication using the new Supabase client
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;
    
    // Get the full invitation with relations
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    }) as (Invitation & { organization: Organization }) | null;
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Check if the invitation is still valid
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }
    
    if (new Date() > invitation.expiresAt) {
      await updateInvitationStatus(invitation.id, 'expired');
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }
    
    // Check if the invitation email matches the authenticated user's email
    if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      );
    }
    
    // Add the user to the organization with the specified role
    await addUserToOrganization(
      session.user.id,
      invitation.organizationId,
      invitation.roleId
    );
    
    // Update the invitation status to accepted
    await updateInvitationStatus(invitation.id, 'accepted');
    
    return NextResponse.json({
      accepted: true,
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
        slug: invitation.organization.slug,
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// Decline an invitation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Check authentication using the new Supabase client
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;
    
    // Get the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Check if the invitation is still valid
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }
    
    // Check if the invitation email matches the authenticated user's email
    if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      );
    }
    
    // Update the invitation status to declined
    await updateInvitationStatus(invitation.id, 'declined');
    
    return NextResponse.json({ declined: true });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
} 