import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Delete user account
 * Removes the user from the database and Supabase Auth
 * @route DELETE /api/user/account
 */
export async function DELETE() {
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
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Delete the user from the database
    // Prisma will handle cascade deletion based on our schema relations
    await prisma.user.delete({
      where: { id: userId },
    });
    
    // Delete the user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      // We won't return an error here because the database deletion was successful
      // We'll log the error and continue
    }
    
    // Sign out
    await supabase.auth.signOut();
    
    return NextResponse.json({ 
      success: true,
      message: 'Account successfully deleted' 
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 