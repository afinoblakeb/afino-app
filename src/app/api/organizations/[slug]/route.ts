import { NextResponse } from 'next/server';
import { prisma } from '@/utils/database/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication using the new Supabase client
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { slug } = await params;
    
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        users: {
          where: { userId: session.user.id },
          include: { role: true }
        }
      }
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Check if the user is a member of the organization
    if (organization.users.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication using the new Supabase client
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing its properties in Next.js 15+
    const { slug } = await params;
    const { name, domain } = await request.json();
    
    // Find the organization and check if the user is an admin
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        users: {
          where: { 
            userId: session.user.id,
            role: {
              name: 'Admin'
            }
          }
        }
      }
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Check if the user is an admin
    if (organization.users.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Update the organization
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        name,
        domain
      }
    });
    
    return NextResponse.json({ organization: updatedOrganization });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
} 