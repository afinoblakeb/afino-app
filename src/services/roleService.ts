// Mock implementation for development
// This will be replaced with actual Prisma implementation later

/**
 * Role interface
 */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

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

// Mock roles data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: ADMIN_PERMISSIONS,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Member',
    permissions: MEMBER_PERMISSIONS,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Gets or creates the admin role
 */
export async function getOrCreateAdminRole(): Promise<Role> {
  const adminRole = mockRoles.find(role => role.name === 'Admin');
  
  if (adminRole) {
    return adminRole;
  }
  
  const newRole: Role = {
    id: String(mockRoles.length + 1),
    name: 'Admin',
    permissions: ADMIN_PERMISSIONS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockRoles.push(newRole);
  return newRole;
}

/**
 * Gets or creates the member role
 */
export async function getOrCreateMemberRole(): Promise<Role> {
  const memberRole = mockRoles.find(role => role.name === 'Member');
  
  if (memberRole) {
    return memberRole;
  }
  
  const newRole: Role = {
    id: String(mockRoles.length + 1),
    name: 'Member',
    permissions: MEMBER_PERMISSIONS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockRoles.push(newRole);
  return newRole;
}

/**
 * Gets a role by ID
 */
export async function getRoleById(id: string): Promise<Role | null> {
  if (!id) {
    return null;
  }
  
  return mockRoles.find(role => role.id === id) || null;
}

/**
 * Gets a role by name
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  if (!name) {
    return null;
  }
  
  return mockRoles.find(role => role.name === name) || null;
}

/**
 * Creates a new role
 */
export async function createRole(name: string, permissions: string[]): Promise<Role> {
  if (!name) {
    throw new Error('Role name is required');
  }
  
  const newRole: Role = {
    id: String(mockRoles.length + 1),
    name,
    permissions,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockRoles.push(newRole);
  return newRole;
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
  
  const roleIndex = mockRoles.findIndex(role => role.id === id);
  
  if (roleIndex === -1) {
    throw new Error('Role not found');
  }
  
  const updatedRole = {
    ...mockRoles[roleIndex],
    ...data,
    updatedAt: new Date(),
  };
  
  mockRoles[roleIndex] = updatedRole;
  return updatedRole;
}

/**
 * Deletes a role
 */
export async function deleteRole(id: string): Promise<Role> {
  if (!id) {
    throw new Error('Role ID is required');
  }
  
  const roleIndex = mockRoles.findIndex(role => role.id === id);
  
  if (roleIndex === -1) {
    throw new Error('Role not found');
  }
  
  const deletedRole = mockRoles[roleIndex];
  mockRoles.splice(roleIndex, 1);
  
  return deletedRole;
} 