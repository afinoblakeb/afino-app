import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create default roles
  await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      permissions: ['manage_users', 'manage_organization', 'manage_roles', 'invite_users', 'view_organization'],
    },
  });

  await prisma.role.upsert({
    where: { name: 'Member' },
    update: {},
    create: {
      name: 'Member',
      permissions: ['view_organization'],
    },
  });
  
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