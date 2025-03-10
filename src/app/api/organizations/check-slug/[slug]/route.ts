import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    // Check if the slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });
    
    return NextResponse.json({ 
      available: !existingOrg,
      slug 
    });
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
} 