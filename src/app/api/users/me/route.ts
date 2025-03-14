import { NextResponse } from 'next/server';
import { prisma } from '@/utils/database/prisma';
import { createApiSupabaseClient } from '@/utils/supabase/api-client';

/**
 * Get the current user's profile
 * @route GET /api/users/me
 */
export async function GET(request: Request) {
  try {
    // Get the user session with the new client approach
    const supabase = createApiSupabaseClient(request);
    
    // Use getUser() instead of getSession() to avoid security warning
    // This makes a server call to validate the authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({ error: 'Authentication failed', message: userError.message }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', message: 'No authenticated user found' }, { status: 401 });
    }
    
    try {
      // Get user profile from database
      let userProfile = await prisma.user.findUnique({
        where: { id: user.id },
      });
      
      // If user profile doesn't exist in the database yet, create it
      if (!userProfile) {
        userProfile = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || null,
            avatarUrl: user.user_metadata?.avatar_url || null,
          },
        });
      }
      
      // Return the user profile information
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: userProfile.name || user.user_metadata?.full_name || null,
        avatar_url: userProfile.avatarUrl || user.user_metadata?.avatar_url || null,
        created_at: userProfile.createdAt || user.created_at,
        updated_at: userProfile.updatedAt || user.updated_at,
      });
    } catch {
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch or create user profile' },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 