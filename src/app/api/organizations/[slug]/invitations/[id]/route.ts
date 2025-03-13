import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/utils/database/prisma';
import { getOrganizationBySlug } from '@/services/organizationService';
import { 
  deleteInvitation, 
  resendInvitation
} from '@/services/invitationService';

// Delete (cancel) an invitation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    // Check authentication using the new Supabase client
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { slug, id } = await params;
    
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
    
    // Check if the invitation exists and belongs to this organization
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Delete the invitation
    await deleteInvitation(id);
    
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    );
  }
}

// Resend an invitation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    // Check authentication using the new Supabase client
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { slug, id } = await params;
    
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
    
    // Check if the invitation exists and belongs to this organization
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Resend the invitation
    const updatedInvitation = await resendInvitation(id);
    
    // TODO: Send invitation email
    
    return NextResponse.json({ invitation: updatedInvitation, resent: true });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
} 