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
 * Gets or creates the admin role.
 * 
 * @returns The admin role
 */
export async function getOrCreateAdminRole(): Promise<Role> {
  let adminRole = await prisma.role.findUnique({
    where: { name: 'Admin' },
  });
  
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        permissions: ADMIN_PERMISSIONS,
      },
    });
  }
  
  return adminRole;
}

/**
 * Gets or creates the member role.
 * 
 * @returns The member role
 */
export async function getOrCreateMemberRole(): Promise<Role> {
  let memberRole = await prisma.role.findUnique({
    where: { name: 'Member' },
  });
  
  if (!memberRole) {
    memberRole = await prisma.role.create({
      data: {
        name: 'Member',
        permissions: MEMBER_PERMISSIONS,
      },
    });
  }
  
  return memberRole;
}

/**
 * Gets a role by ID.
 * 
 * @param id - The role ID
 * @returns The role, or null if not found
 */
export async function getRoleById(id: string): Promise<Role | null> {
  if (!id) {
    return null;
  }
  
  return prisma.role.findUnique({
    where: { id },
  });
}

/**
 * Gets a role by name.
 * 
 * @param name - The role name
 * @returns The role, or null if not found
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  if (!name) {
    return null;
  }
  
  return prisma.role.findUnique({
    where: { name },
  });
}

/**
 * Creates a new role.
 * 
 * @param name - The role name
 * @param permissions - The role permissions
 * @returns The created role
 */
export async function createRole(name: string, permissions: string[]): Promise<Role> {
  if (!name) {
    throw new Error('Role name is required');
  }
  
  return prisma.role.create({
    data: {
      name,
      permissions,
    },
  });
}

/**
 * Updates a role.
 * 
 * @param id - The role ID
 * @param data - The data to update
 * @returns The updated role
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
 * Deletes a role.
 * 
 * @param id - The role ID
 * @returns The deleted role
 */
export async function deleteRole(id: string): Promise<Role> {
  if (!id) {
    throw new Error('Role ID is required');
  }
  
  return prisma.role.delete({
    where: { id },
  });
} 