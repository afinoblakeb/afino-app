import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { findOrganizationByDomain } from '@/services/organizationService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const domain = (await params).domain;
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find organization by domain
    const organization = await findOrganizationByDomain(domain);
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error finding organization by domain:', error);
    return NextResponse.json(
      { error: 'Failed to find organization' },
      { status: 500 }
    );
  }
} 