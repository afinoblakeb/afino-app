import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create default roles
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