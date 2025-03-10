import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
  // Get the current session
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
    redirect('/auth/signin');
  }
  
  // Get user data from Prisma
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organizations: {
        include: {
          organization: true,
          role: true,
        },
      },
    },
  });
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  return <ProfileClient user={user} />;
} 