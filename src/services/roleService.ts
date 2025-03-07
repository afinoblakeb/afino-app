import { PrismaClient, Role } from '@prisma/client';
import { RoleWhereInput } from '@/types/prisma';

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
    where: { id } as RoleWhereInput,
  });
}

/**
 * Gets a role by name
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  if (!name) {
    return null;
  }
  
  return prisma.role.findFirst({
    where: { name } as RoleWhereInput,
  });
}

/**
 * Gets all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  return prisma.role.findMany();
}

/**
 * Gets the admin role
 */
export async function getAdminRole(): Promise<Role | null> {
  return getRoleByName('Admin');
}

/**
 * Gets the member role
 */
export async function getMemberRole(): Promise<Role | null> {
  return getRoleByName('Member');
}

/**
 * Gets or creates the admin role
 */
export async function getOrCreateAdminRole(): Promise<Role> {
  const adminRole = await getAdminRole();
  
  if (adminRole) {
    return adminRole;
  }
  
  return prisma.role.create({
    data: {
      name: 'Admin',
      permissions: ADMIN_PERMISSIONS,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
}

/**
 * Gets or creates the member role
 */
export async function getOrCreateMemberRole(): Promise<Role> {
  const memberRole = await getMemberRole();
  
  if (memberRole) {
    return memberRole;
  }
  
  return prisma.role.create({
    data: {
      name: 'Member',
      permissions: MEMBER_PERMISSIONS,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
}

/**
 * Creates a new role
 */
export async function createRole(name: string, permissions: string[]): Promise<Role> {
  if (!name) {
    throw new Error('Role name is required');
  }
  
  return prisma.role.create({
    data: {
      name,
      permissions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
}

/**
 * Updates a role
 */
export async function updateRole(
  id: string,
  data: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>
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