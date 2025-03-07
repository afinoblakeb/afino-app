import { extractDomain, suggestOrganizationName } from '@/utils/domainUtils';

// Mock types
export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
  organization: Organization;
  role: {
    id: string;
    name: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Inc',
    domain: 'acme.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Example Corp',
    domain: 'example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUserOrganizations: UserOrganization[] = [];

/**
 * Finds an organization by domain
 */
export async function findOrganizationByDomain(domain: string): Promise<Organization | null> {
  if (!domain) {
    return null;
  }
  
  return mockOrganizations.find(org => org.domain === domain) || null;
}

/**
 * Gets an organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  if (!id) {
    return null;
  }
  
  return mockOrganizations.find(org => org.id === id) || null;
}

/**
 * Creates a new organization
 */
export async function createOrganization(
  name: string,
  domain: string | null = null
): Promise<Organization> {
  if (!name) {
    throw new Error('Organization name is required');
  }
  
  const newOrg: Organization = {
    id: String(mockOrganizations.length + 1),
    name,
    domain,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockOrganizations.push(newOrg);
  return newOrg;
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
  
  const organization = await getOrganizationById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  const userOrg: UserOrganization = {
    id: String(mockUserOrganizations.length + 1),
    userId,
    organizationId,
    roleId,
    createdAt: new Date(),
    updatedAt: new Date(),
    organization,
    role: {
      id: roleId,
      name: roleId === '1' ? 'Admin' : 'Member',
      permissions: roleId === '1' ? ['manage_users', 'manage_organization'] : ['view_organization'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  
  mockUserOrganizations.push(userOrg);
  return userOrg;
}

/**
 * Gets all organizations a user belongs to
 */
export async function getUserOrganizations(userId: string): Promise<UserOrganization[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  return mockUserOrganizations.filter(userOrg => userOrg.userId === userId);
}

/**
 * Gets all users in an organization
 */
export async function getOrganizationUsers(organizationId: string): Promise<UserOrganization[]> {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }
  
  return mockUserOrganizations.filter(userOrg => userOrg.organizationId === organizationId);
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
  
  return mockUserOrganizations.some(
    userOrg => userOrg.userId === userId && userOrg.organizationId === organizationId
  );
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
  organization = await createOrganization(orgName, domain);
  
  return { organization, created: true };
} 