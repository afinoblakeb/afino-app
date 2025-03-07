import { PrismaClient, User } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const prisma = new PrismaClient();

/**
 * Creates a user profile from Supabase Auth data.
 * 
 * @param supabaseUser - The user data from Supabase Auth
 * @returns The created user
 */
export async function createUserProfile(supabaseUser: SupabaseUser): Promise<User> {
  // Extract user data from Supabase Auth
  const { id, email, user_metadata } = supabaseUser;
  
  if (!email) {
    throw new Error('User email is required');
  }
  
  // Create user in our database
  const user = await prisma.user.create({
    data: {
      id,
      email,
      name: user_metadata?.full_name || user_metadata?.name,
      firstName: user_metadata?.first_name || user_metadata?.given_name,
      lastName: user_metadata?.last_name || user_metadata?.family_name,
      avatarUrl: user_metadata?.avatar_url || user_metadata?.picture,
    },
  });
  
  return user;
}

/**
 * Gets a user by ID.
 * 
 * @param id - The user ID
 * @returns The user, or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Gets a user by email.
 * 
 * @param email - The user email
 * @returns The user, or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Updates a user profile.
 * 
 * @param id - The user ID
 * @param data - The data to update
 * @returns The updated user
 */
export async function updateUserProfile(
  id: string,
  data: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Gets a user with their organizations.
 * 
 * @param id - The user ID
 * @returns The user with organizations, or null if not found
 */
export async function getUserWithOrganizations(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      organizations: {
        include: {
          organization: true,
          role: true,
        },
      },
    },
  });
} 