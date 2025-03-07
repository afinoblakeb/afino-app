import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const prisma = new PrismaClient();

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
 * Creates a user profile from Supabase Auth data
 */
export async function createUserProfile(supabaseUser: SupabaseUser): Promise<PrismaUser> {
  const { id, email, user_metadata } = supabaseUser;
  
  if (!email) {
    throw new Error('Email is required to create a user profile');
  }
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });
  
  if (existingUser) {
    return existingUser;
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
 * Gets a user by ID
 */
export async function getUserById(id: string): Promise<PrismaUser | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Gets a user by email
 */
export async function getUserByEmail(email: string): Promise<PrismaUser | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Updates a user profile
 */
export async function updateUserProfile(
  id: string,
  data: Partial<Omit<PrismaUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<PrismaUser> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Gets a user with their organizations
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