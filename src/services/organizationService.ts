import { PrismaClient, Organization, UserOrganization } from '@prisma/client';
import { extractDomain, suggestOrganizationName } from '@/utils/domainUtils';
import { getOrCreateAdminRoleForOrganization, getOrCreateMemberRoleForOrganization } from './roleService';

const prisma = new PrismaClient();

/**
 * Generates a slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Finds an organization by domain
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
 * Gets an organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  if (!id) {
    return null;
  }
  
  return prisma.organization.findUnique({
    where: { id },
  });
}

/**
 * Gets an organization by slug
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  if (!slug) {
    return null;
  }
  
  return prisma.organization.findUnique({
    where: { slug },
  });
}

/**
 * Creates a new organization
 */
export async function createOrganization(
  name: string,
  domain: string | null = null,
  slug?: string
): Promise<Organization> {
  if (!name) {
    throw new Error('Organization name is required');
  }
  
  // Generate slug if not provided
  const orgSlug = slug || generateSlug(name);
  
  const organization = await prisma.organization.create({
    data: {
      name,
      domain,
      slug: orgSlug,
    },
  });
  
  // Create default roles for the organization
  await getOrCreateAdminRoleForOrganization(organization.id);
  await getOrCreateMemberRoleForOrganization(organization.id);
  
  return organization;
}

/**
 * Adds a user to an organization with a specific role
 */
export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  roleId: string
): Promise<UserOrganization> {
  if (!userId || !organizationId || !roleId) {
    throw new Error('User ID, organization ID, and role ID are required');
  }
  
  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId,
      roleId,
    },
  });
}

/**
 * Gets all organizations a user belongs to
 */
export async function getUserOrganizations(userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  return prisma.userOrganization.findMany({
    where: { userId },
    include: {
      organization: true,
      role: true,
    },
  });
}

/**
 * Gets all users in an organization
 */
export async function getOrganizationUsers(organizationId: string) {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }
  
  return prisma.userOrganization.findMany({
    where: { organizationId },
    include: {
      user: true,
      role: true,
    },
  });
}

/**
 * Checks if a user is a member of an organization
 */
export async function isUserInOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  if (!userId || !organizationId) {
    return false;
  }
  
  const membership = await prisma.userOrganization.findFirst({
    where: {
      userId,
      organizationId,
    },
  });
  
  return !!membership;
}

/**
 * Creates an organization from an email address or finds an existing one
 */
export async function createOrganizationFromEmail(
  email: string,
  name?: string
): Promise<{ organization: Organization; created: boolean }> {
  const domain = extractDomain(email);
  
  if (!domain) {
    throw new Error('Invalid email address');
  }
  
  // Check if organization with this domain already exists
  let organization = await findOrganizationByDomain(domain);
  
  if (organization) {
    return { organization, created: false };
  }
  
  // Create new organization
  const orgName = name || suggestOrganizationName(domain);
  const slug = generateSlug(orgName);
  organization = await createOrganization(orgName, domain, slug);
  
  return { organization, created: true };
}

/**
 * Updates an organization
 */
export async function updateOrganization(
  id: string,
  data: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Organization> {
  if (!id) {
    throw new Error('Organization ID is required');
  }
  
  return prisma.organization.update({
    where: { id },
    data,
  });
} 