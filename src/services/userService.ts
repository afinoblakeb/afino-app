import { PrismaClient, User } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const prisma = new PrismaClient();

/**
 * Type for user data from Supabase Auth
 */
interface SupabaseUserMetadata {
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

/**
 * Creates a user profile from Supabase Auth data.
 * 
 * @param supabaseUser - The user data from Supabase Auth
 * @returns The created user
 */
export async function createUserProfile(supabaseUser: SupabaseUser): Promise<User> {
  const { id, email, user_metadata } = supabaseUser;
  
  if (!email) {
    throw new Error('Email is required to create a user profile');
  }
  
  const metadata = user_metadata as SupabaseUserMetadata;
  
  // Extract name information from metadata
  const name = metadata.full_name || metadata.name || '';
  const firstName = metadata.first_name || name.split(' ')[0] || '';
  const lastName = metadata.last_name || (name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : '') || '';
  
  // Create user in our database
  const user = await prisma.user.create({
    data: {
      id,
      email,
      name,
      firstName,
      lastName,
      avatarUrl: metadata.avatar_url,
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