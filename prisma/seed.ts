import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@afino.com' },
    update: {},
    create: {
      email: 'admin@afino.com',
      fullName: 'Admin User',
      // In production, use environment variables for sensitive data
      // This is just for development seeding
      // Note: In a real app, Supabase would handle password hashing
    },
  });

  // Create default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: 'default-organization' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default-organization',
    },
  });

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { 
      organizationId_name: {
        organizationId: defaultOrg.id,
        name: 'Admin'
      }
    },
    update: {},
    create: {
      name: 'Admin',
      organizationId: defaultOrg.id,
      permissions: {
        users: { create: true, read: true, update: true, delete: true },
        organizations: { create: true, read: true, update: true, delete: true },
        members: { create: true, read: true, update: true, delete: true },
        invitations: { create: true, read: true, update: true, delete: true },
      },
    },
  });

  // Create member role (for future use)
  await prisma.role.upsert({
    where: { 
      organizationId_name: {
        organizationId: defaultOrg.id,
        name: 'Member'
      }
    },
    update: {},
    create: {
      name: 'Member',
      organizationId: defaultOrg.id,
      permissions: {
        users: { create: false, read: true, update: false, delete: false },
        organizations: { create: false, read: true, update: false, delete: false },
        members: { create: false, read: true, update: false, delete: false },
        invitations: { create: false, read: true, update: false, delete: false },
      },
    },
  });

  // Add admin user to organization with admin role
  await prisma.member.upsert({
    where: {
      organizationId_userId: {
        organizationId: defaultOrg.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      organizationId: defaultOrg.id,
      userId: adminUser.id,
      roleId: adminRole.id,
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