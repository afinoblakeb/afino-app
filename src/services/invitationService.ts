import { PrismaClient, Invitation } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Creates a new invitation
 * @param data The invitation data
 * @returns The created invitation
 */
export async function createInvitation(data: {
  email: string;
  organizationId: string;
  roleId: string;
  invitedById?: string;
}): Promise<Invitation> {
  const { email, organizationId, roleId, invitedById } = data;
  
  // Generate a secure token
  const token = uuidv4();
  
  // Set expiration date (7 days from now)
  const expiresAt = addDays(new Date(), 7);
  
  // Create the invitation
  const invitation = await prisma.invitation.create({
    data: {
      email,
      organizationId,
      roleId,
      invitedById,
      token,
      expiresAt,
      status: 'pending',
    },
  });
  
  return invitation;
}

/**
 * Gets an invitation by its token
 * @param token The invitation token
 * @returns The invitation or null if not found
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  return prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: true,
      role: true,
      invitedBy: true,
    },
  });
}

/**
 * Gets invitations for an organization
 * @param organizationId The organization ID
 * @returns An array of invitations
 */
export async function getOrganizationInvitations(organizationId: string): Promise<Invitation[]> {
  return prisma.invitation.findMany({
    where: { organizationId },
    include: {
      role: true,
      invitedBy: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Updates the status of an invitation
 * @param id The invitation ID
 * @param status The new status
 * @returns The updated invitation
 */
export async function updateInvitationStatus(
  id: string,
  status: 'pending' | 'accepted' | 'declined' | 'expired'
): Promise<Invitation> {
  return prisma.invitation.update({
    where: { id },
    data: { status },
  });
}

/**
 * Deletes an invitation
 * @param id The invitation ID
 * @returns The deleted invitation
 */
export async function deleteInvitation(id: string): Promise<Invitation> {
  return prisma.invitation.delete({
    where: { id },
  });
}

/**
 * Checks if an invitation token is valid
 * @param token The invitation token
 * @returns Object indicating if the token is valid and any error message
 */
export async function validateInvitationToken(token: string): Promise<{ 
  valid: boolean; 
  invitation?: Invitation; 
  error?: string;
}> {
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    return { valid: false, error: 'Invitation not found' };
  }
  
  if (invitation.status !== 'pending') {
    return { 
      valid: false, 
      invitation, 
      error: `Invitation has already been ${invitation.status}` 
    };
  }
  
  if (new Date() > invitation.expiresAt) {
    // Auto-update the status to expired
    await updateInvitationStatus(invitation.id, 'expired');
    return { valid: false, invitation, error: 'Invitation has expired' };
  }
  
  return { valid: true, invitation };
}

/**
 * Resends an invitation by generating a new token and expiration date
 * @param id The invitation ID
 * @returns The updated invitation
 */
export async function resendInvitation(id: string): Promise<Invitation> {
  const token = uuidv4();
  const expiresAt = addDays(new Date(), 7);
  
  return prisma.invitation.update({
    where: { id },
    data: {
      token,
      expiresAt,
      status: 'pending',
      updatedAt: new Date(),
    },
  });
}

/**
 * Checks if a user is already invited to an organization
 * @param email Email to check
 * @param organizationId Organization ID
 * @returns Boolean indicating if the user is already invited
 */
export async function isAlreadyInvited(email: string, organizationId: string): Promise<boolean> {
  const invitation = await prisma.invitation.findFirst({
    where: {
      email,
      organizationId,
      status: 'pending',
    },
  });
  
  return !!invitation;
} 