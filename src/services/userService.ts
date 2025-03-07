import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserOrganization } from './organizationService';

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

// Mock users data
const mockUsers: User[] = [];

/**
 * Creates a user profile from Supabase Auth data
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
  
  // Check if user already exists
  const existingUser = mockUsers.find(user => user.id === id);
  if (existingUser) {
    return existingUser;
  }
  
  // Create new user
  const newUser: User = {
    id,
    email,
    name: name || null,
    firstName: firstName || null,
    lastName: lastName || null,
    avatarUrl: metadata.avatar_url || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockUsers.push(newUser);
  return newUser;
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return mockUsers.find(user => user.id === id) || null;
}

/**
 * Gets a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return mockUsers.find(user => user.email === email) || null;
}

/**
 * Updates a user profile
 */
export async function updateUserProfile(
  id: string,
  data: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<User> {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const updatedUser = {
    ...mockUsers[userIndex],
    ...data,
    updatedAt: new Date(),
  };
  
  mockUsers[userIndex] = updatedUser;
  return updatedUser;
}

/**
 * Gets a user with their organizations
 */
export async function getUserWithOrganizations(id: string): Promise<User & { organizations: UserOrganization[] } | null> {
  const user = await getUserById(id);
  
  if (!user) {
    return null;
  }
  
  // This is a mock implementation, so we'll return an empty array of organizations
  return {
    ...user,
    organizations: [],
  };
} 