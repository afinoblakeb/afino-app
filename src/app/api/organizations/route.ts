import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createOrganization, getOrganizationBySlug, findOrganizationByDomain } from '@/services/organizationService';
import { getOrCreateAdminRoleForOrganization } from '@/services/roleService';
import { addUserToOrganization } from '@/services/organizationService';
import { extractDomain } from '@/utils/domainUtils';
import { z } from 'zod';

// Schema for request validation
const createOrganizationSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9\-]+$/).optional(),
  domain: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      createOrganizationSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
    }
    
    const { name, slug, domain } = body;
    
    // Properly await cookies in Next.js 15
    const cookieStore = await cookies();
    
    // Create Supabase client with proper cookie handling for Next.js 15
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
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // If slug is provided, check if it's already taken
    if (slug) {
      const existingOrg = await getOrganizationBySlug(slug);
      if (existingOrg) {
        return NextResponse.json(
          { error: 'This slug is already taken' },
          { status: 400 }
        );
      }
    }
    
    // If domain is not provided, extract it from the user's email
    const orgDomain = domain || (user.email ? extractDomain(user.email) : null);
    
    // Check if domain is already in use (if a domain is provided)
    if (orgDomain) {
      const existingOrgWithDomain = await findOrganizationByDomain(orgDomain);
      if (existingOrgWithDomain) {
        return NextResponse.json(
          { error: 'An organization with this domain already exists' },
          { status: 400 }
        );
      }
    }
    
    // Create the organization
    const organization = await createOrganization(name, orgDomain, slug);
    
    // Get admin role for this organization
    const adminRole = await getOrCreateAdminRoleForOrganization(organization.id);
    
    // Add user to organization as admin
    await addUserToOrganization(user.id, organization.id, adminRole.id);
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
} 