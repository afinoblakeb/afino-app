import { PrismaClient, Organization, UserOrganization } from '@prisma/client';
import { extractDomain } from '@/utils/domainUtils';

const prisma = new PrismaClient();

/**
 * Finds an organization by domain.
 * 
 * @param domain - The domain to search for
 * @returns The organization, or null if not found
 */
export async function findOrganizationByDomain(domain: string): Promise<Organization | null> {
  if (!domain) {
    return null;
  }
  
  return prisma.organization.findUnique({
    where: { domain },
  });
}

/**
 * Finds an organization by ID.
 * 
 * @param id - The organization ID
 * @returns The organization, or null if not found
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { id },
  });
}

/**
 * Creates a new organization.
 * 
 * @param name - The organization name
 * @param domain - The organization domain (optional)
 * @returns The created organization
 */
export async function createOrganization(
  name: string,
  domain: string | null = null
): Promise<Organization> {
  return prisma.organization.create({
    data: {
      name,
      domain,
    },
  });
}

/**
 * Adds a user to an organization with a specific role.
 * 
 * @param userId - The user ID
 * @param organizationId - The organization ID
 * @param roleId - The role ID
 * @returns The created user-organization relationship
 */
export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  roleId: string
): Promise<UserOrganization> {
  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId,
      roleId,
    },
  });
}

/**
 * Gets all organizations for a user.
 * 
 * @param userId - The user ID
 * @returns The organizations the user belongs to
 */
export async function getUserOrganizations(userId: string) {
  return prisma.userOrganization.findMany({
    where: { userId },
    include: {
      organization: true,
      role: true,
    },
  });
}

/**
 * Gets all users in an organization.
 * 
 * @param organizationId - The organization ID
 * @returns The users in the organization
 */
export async function getOrganizationUsers(organizationId: string) {
  return prisma.userOrganization.findMany({
    where: { organizationId },
    include: {
      user: true,
      role: true,
    },
  });
}

/**
 * Checks if a user is a member of an organization.
 * 
 * @param userId - The user ID
 * @param organizationId - The organization ID
 * @returns Whether the user is a member of the organization
 */
export async function isUserInOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });
  
  return !!membership;
}

/**
 * Creates an organization from a user's email domain if it doesn't exist.
 * 
 * @param email - The user's email
 * @param name - The organization name (optional, defaults to domain name)
 * @returns The organization and whether it was created
 */
export async function createOrganizationFromEmail(
  email: string,
  name?: string
): Promise<{ organization: Organization; created: boolean }> {
  const domain = extractDomain(email);
  
  if (!domain) {
    throw new Error('Invalid email format');
  }
  
  // Check if organization with this domain already exists
  const existingOrg = await findOrganizationByDomain(domain);
  
  if (existingOrg) {
    return { organization: existingOrg, created: false };
  }
  
  // Create new organization
  const orgName = name || domain.split('.')[0];
  const organization = await createOrganization(orgName, domain);
  
  return { organization, created: true };
} 