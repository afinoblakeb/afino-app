import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiSupabaseClient } from '@/utils/supabase/api-client';

// Get the current user's profile
export async function GET(request: Request) {
  console.log('[API Users/Me] Processing user profile request');
  
  try {
    // Get the user session with the new client approach
    const supabase = createApiSupabaseClient(request);
    
    // Use getUser() instead of getSession() to avoid security warning
    // This makes a server call to validate the authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[API Users/Me] Authentication error:', userError.message);
      return NextResponse.json({ error: 'Authentication failed', message: userError.message }, { status: 401 });
    }
    
    if (!user) {
      console.error('[API Users/Me] No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized', message: 'No authenticated user found' }, { status: 401 });
    }
    
    console.log(`[API Users/Me] Successfully authenticated user: ${user.id}`);
    
    try {
      // Get user profile from database
      let userProfile = await prisma.user.findUnique({
        where: { id: user.id },
      });
      
      console.log(`[API Users/Me] User profile exists in database: ${!!userProfile}`);
      
      // If user profile doesn't exist in the database yet, create it
      if (!userProfile) {
        console.log(`[API Users/Me] Creating new user profile for user: ${user.id}`);
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
    } catch (dbError) {
      console.error('[API Users/Me] Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch or create user profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API Users/Me] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 