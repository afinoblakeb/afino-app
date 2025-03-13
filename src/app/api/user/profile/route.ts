import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for validation
const updateProfileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }).max(50),
  lastName: z.string().min(1, { message: 'Last name is required' }).max(50),
  jobTitle: z.string().optional(),
  bio: z.string().max(500).optional(),
});

/**
 * Get the current user's profile
 * @route GET /api/user/profile
 */
export async function GET() {
  try {
    // Get the user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Use getUser() instead of getSession() to avoid warning
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user profile from the database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return the user profile data
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
      jobTitle: userData.jobTitle,
      bio: userData.bio,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

/**
 * Update the user's profile
 * @route PUT /api/user/profile
 */
export async function PUT(request: Request) {
  try {
    // Get the user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Use getUser() instead of getSession() to avoid warning
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      updateProfileSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
    }
    
    // Update the user's profile in the database
    const { firstName, lastName, jobTitle, bio } = body;
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        jobTitle,
        bio,
        updatedAt: new Date(),
      },
    });
    
    // Return the updated user data
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      jobTitle: updatedUser.jobTitle,
      bio: updatedUser.bio,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 