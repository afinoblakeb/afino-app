import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { findOrganizationByDomain } from '@/services/organizationService';

export async function GET(
  request: Request,
  { params }: { params: { domain: string } }
) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { domain } = params;
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
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