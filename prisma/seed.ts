import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
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
  const adminRole = await prisma.role.findFirst({
    where: { 
      name: 'Admin',
      organizationId: systemOrgId,
    },
  });
  
  if (!adminRole) {
    await prisma.role.create({
      data: {
        name: 'Admin',
        permissions: ['manage_users', 'manage_organization', 'manage_roles', 'invite_users', 'view_organization'],
        organization: {
          connect: { id: systemOrgId }
        }
      },
    });
    console.log('Admin role created');
  }

  const memberRole = await prisma.role.findFirst({
    where: { 
      name: 'Member',
      organizationId: systemOrgId,
    },
  });
  
  if (!memberRole) {
    await prisma.role.create({
      data: {
        name: 'Member',
        permissions: ['view_organization'],
        organization: {
          connect: { id: systemOrgId }
        }
      },
    });
    console.log('Member role created');
  }
  
  console.log('Database has been seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 