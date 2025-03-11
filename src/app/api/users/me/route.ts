import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Get the current user's profile
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
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 