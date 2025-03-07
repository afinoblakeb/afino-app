import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default permissions for admin role
 */
const ADMIN_PERMISSIONS = [
  'manage_users',
  'manage_organization',
  'manage_roles',
  'invite_users',
  'view_organization',
];

/**
 * Default permissions for member role
 */
const MEMBER_PERMISSIONS = [
  'view_organization',
];

/**
 * Gets a role by ID
 */
export async function getRoleById(id: string): Promise<Role | null> {
  if (!id) {
    return null;
  }
  
  return prisma.role.findFirst({
    where: { id },
  });
}

/**
 * Gets a role by name and organization ID
 */
export async function getRoleByNameAndOrganization(name: string, organizationId: string): Promise<Role | null> {
  if (!name || !organizationId) {
    return null;
  }
  
  return prisma.role.findFirst({
    where: { 
      name,
      organizationId,
    },
  });
}

/**
 * Gets all roles for an organization
 */
export async function getRolesByOrganization(organizationId: string): Promise<Role[]> {
  if (!organizationId) {
    return [];
  }
  
  return prisma.role.findMany({
    where: { organizationId },
  });
}

/**
 * Gets the admin role for an organization
 */
export async function getAdminRoleForOrganization(organizationId: string): Promise<Role | null> {
  return getRoleByNameAndOrganization('Admin', organizationId);
}

/**
 * Gets the member role for an organization
 */
export async function getMemberRoleForOrganization(organizationId: string): Promise<Role | null> {
  return getRoleByNameAndOrganization('Member', organizationId);
}

/**
 * Gets or creates the admin role for an organization
 */
export async function getOrCreateAdminRoleForOrganization(organizationId: string): Promise<Role> {
  const adminRole = await getAdminRoleForOrganization(organizationId);
  
  if (adminRole) {
    return adminRole;
  }
  
  return prisma.role.create({
    data: {
      name: 'Admin',
      permissions: ADMIN_PERMISSIONS,
      organization: {
        connect: { id: organizationId }
      }
    },
  });
}

/**
 * Gets or creates the member role for an organization
 */
export async function getOrCreateMemberRoleForOrganization(organizationId: string): Promise<Role> {
  const memberRole = await getMemberRoleForOrganization(organizationId);
  
  if (memberRole) {
    return memberRole;
  }
  
  return prisma.role.create({
    data: {
      name: 'Member',
      permissions: MEMBER_PERMISSIONS,
      organization: {
        connect: { id: organizationId }
      }
    },
  });
}

/**
 * Creates a new role for an organization
 */
export async function createRoleForOrganization(
  name: string, 
  permissions: string[], 
  organizationId: string
): Promise<Role> {
  if (!name || !organizationId) {
    throw new Error('Role name and organization ID are required');
  }
  
  return prisma.role.create({
    data: {
      name,
      permissions,
      organization: {
        connect: { id: organizationId }
      }
    },
  });
}

/**
 * Updates a role
 */
export async function updateRole(
  id: string,
  data: Partial<Omit<Role, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>>
): Promise<Role> {
  if (!id) {
    throw new Error('Role ID is required');
  }
  
  return prisma.role.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a role
 */
export async function deleteRole(id: string): Promise<Role> {
  if (!id) {
    throw new Error('Role ID is required');
  }
  
  return prisma.role.delete({
    where: { id },
  });
} 