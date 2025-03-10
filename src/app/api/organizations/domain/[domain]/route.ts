import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { domain: string } }
) {
  try {
    const domain = params.domain;
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }
    
    // Find organization by domain
    const organization = await prisma.organization.findUnique({
      where: { domain },
    });
    
    if (!organization) {
      return NextResponse.json(
        { found: false }
      );
    }
    
    return NextResponse.json({
      found: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        domain: organization.domain
      }
    });
  } catch (error) {
    console.error('Error finding organization by domain:', error);
    return NextResponse.json(
      { error: 'Failed to find organization by domain' },
      { status: 500 }
    );
  }
} 