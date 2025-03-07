import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  try {
    // Check if the Role model has an organizationId field
    const roleHasOrgField = await checkIfRoleHasOrgField();
    
    if (roleHasOrgField) {
      await seedWithOrganization();
    } else {
      await seedWithoutOrganization();
    }
    
    console.log('Database has been seeded');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function checkIfRoleHasOrgField(): Promise<boolean> {
  try {
    // Try to query a role with organizationId to see if the field exists
    await prisma.$queryRaw`SELECT "organizationId" FROM "Role" LIMIT 1`;
    return true;
  } catch {
    // If the query fails, the field doesn't exist
    return false;
  }
}

async function seedWithOrganization() {
  // Create a default organization for system-wide roles
  const systemOrg = await prisma.organization.findFirst({
    where: { name: 'System' },
  });
  
  let systemOrgId: string;
  
  if (!systemOrg) {
    const newSystemOrg = await prisma.organization.create({
      data: {
        name: 'System',
      },
    });
    systemOrgId = newSystemOrg.id;
    console.log('System organization created');
  } else {
    systemOrgId = systemOrg.id;
  }
  
  // Create default roles
  try {
    // Try to find Admin role with organizationId
    const adminRole = await prisma.role.findFirst({
      where: {
        name: 'Admin',
        // Use type assertion to handle schema differences
        organizationId: systemOrgId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    
    if (!adminRole) {
      await prisma.role.create({
        data: {
          name: 'Admin',
          permissions: ['manage_users', 'manage_organization', 'manage_roles', 'invite_users', 'view_organization'],
          // Use type assertion to handle schema differences
          organizationId: systemOrgId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      console.log('Admin role created');
    }
    
    const memberRole = await prisma.role.findFirst({
      where: {
        name: 'Member',
        // Use type assertion to handle schema differences
        organizationId: systemOrgId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    
    if (!memberRole) {
      await prisma.role.create({
        data: {
          name: 'Member',
          permissions: ['view_organization'],
          // Use type assertion to handle schema differences
          organizationId: systemOrgId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      console.log('Member role created');
    }
  } catch (error) {
    console.error('Error creating roles with organization:', error);
    throw error;
  }
}

async function seedWithoutOrganization() {
  // Create default roles without organization
  const adminRole = await prisma.role.findFirst({
    where: { name: 'Admin' },
  });
  
  if (!adminRole) {
    await prisma.role.create({
      data: {
        name: 'Admin',
        permissions: ['manage_users', 'manage_organization', 'manage_roles', 'invite_users', 'view_organization'],
      },
    });
    console.log('Admin role created');
  }

  const memberRole = await prisma.role.findFirst({
    where: { name: 'Member' },
  });
  
  if (!memberRole) {
    await prisma.role.create({
      data: {
        name: 'Member',
        permissions: ['view_organization'],
      },
    });
    console.log('Member role created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 