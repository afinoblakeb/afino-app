import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-server-session';
import { validateInvitationToken, updateInvitationStatus } from '@/services/invitationService';
import { addUserToOrganization } from '@/services/organizationService';

// Get invitation details using token
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Await params before accessing its properties in Next.js 15+
    const { token } = await params;
    
    // Validate the invitation token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Return the invitation details
    return NextResponse.json({
      valid: true,
      invitation: {
        id: validation.invitation?.id,
        email: validation.invitation?.email,
        organization: {
          id: validation.invitation?.organization.id,
          name: validation.invitation?.organization.name,
          slug: validation.invitation?.organization.slug,
        },
        role: {
          id: validation.invitation?.role.id,
          name: validation.invitation?.role.name,
        },
        invitedBy: validation.invitation?.invitedBy ? {
          id: validation.invitation?.invitedBy.id,
          name: validation.invitation?.invitedBy.name,
        } : null,
        expiresAt: validation.invitation?.expiresAt,
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
  { params }: { params: { token: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { token } = await params;
    
    // Validate the invitation token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid || !validation.invitation) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const invitation = validation.invitation;
    
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
  { params }: { params: { token: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { token } = await params;
    
    // Validate the invitation token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid || !validation.invitation) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const invitation = validation.invitation;
    
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