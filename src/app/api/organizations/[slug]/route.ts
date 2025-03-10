import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-server-session';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = params.slug;
    
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
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = params.slug;
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