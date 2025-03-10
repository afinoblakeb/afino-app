# Database Schema

This document outlines the database schema for the Afino fintech platform. The database is implemented using PostgreSQL through Supabase, with Prisma ORM for type-safe database access and migration management.

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │  organizations  │       │     members     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ email           │       │ name            │◄──────┤ organization_id │
│ full_name       │       │ slug            │       │ user_id         │
│ avatar_url      │       │ logo_url        │       │ created_at      │
│ phone_number    │       │ created_at      │       │ updated_at      │
│ created_at      │       │ updated_at      │       │ created_at      │
│ updated_at      │       └────────┬────────┘       └────────┬────────┘
└────────┬────────┘                │                         │
         │                         │                         │
         │                         │                         │
         │                         │                         │
         │                         ▼                         │
         │                ┌─────────────────┐                │
         │                │     roles       │                │
         │                ├─────────────────┤                │
         │                │ id              │                │
         │                │ name            │◄───────────────┘
         │                │ organization_id │
         │                │ permissions     │
         │                │ created_at      │
         │                │ updated_at      │
         │                └─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│  user_profiles  │       │   invitations   │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ user_id         │◄──────┤ email           │
│ bio             │       │ organization_id │
│ location        │       │ role_id         │
│ preferences     │       │ token           │
│ created_at      │       │ expires_at      │
│ updated_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘
```

## Prisma Schema

The database schema is defined using Prisma Schema Language (PSL) in the `prisma/schema.prisma` file:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String         @id @default(uuid())
  email        String         @unique
  fullName     String         @map("full_name")
  avatarUrl    String?        @map("avatar_url")
  phoneNumber  String?        @map("phone_number")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  
  // Relations
  profile      UserProfile?
  members      Member[]
  invitations  Invitation[]   @relation("InvitedBy")

  @@map("users")
}

model UserProfile {
  id           String         @id @default(uuid())
  userId       String         @unique @map("user_id")
  bio          String?
  location     String?
  preferences  Json           @default("{}")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  
  // Relations
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model Organization {
  id           String         @id @default(uuid())
  name         String
  slug         String         @unique
  logoUrl      String?        @map("logo_url")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  
  // Relations
  members      Member[]
  roles        Role[]
  invitations  Invitation[]

  @@map("organizations")
}

model Role {
  id             String         @id @default(uuid())
  name           String
  organizationId String         @map("organization_id")
  permissions    Json           @default("{}")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  
  // Relations
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  members        Member[]
  invitations    Invitation[]

  @@unique([organizationId, name])
  @@map("roles")
}

model Member {
  id             String         @id @default(uuid())
  organizationId String         @map("organization_id")
  userId         String         @map("user_id")
  roleId         String         @map("role_id")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  
  // Relations
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  role           Role           @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@unique([organizationId, userId])
  @@map("members")
}

model Invitation {
  id             String         @id @default(uuid())
  email          String
  organizationId String         @map("organization_id")
  roleId         String         @map("role_id")
  token          String         @unique
  expiresAt      DateTime       @map("expires_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  
  // Relations
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  role           Role           @relation(fields: [roleId], references: [id], onDelete: Restrict)
  invitedBy      User?          @relation("InvitedBy", fields: [invitedById], references: [id], onDelete: SetNull)
  invitedById    String?        @map("invited_by_id")

  @@unique([organizationId, email])
  @@map("invitations")
}
```

## Tables

### users

The `users` table stores user authentication information and basic profile data.

| Column       | Type           | Constraints       | Description                       |
|--------------|----------------|-------------------|-----------------------------------|
| id           | uuid           | PK                | Unique identifier                 |
| email        | varchar(255)   | UNIQUE, NOT NULL  | User's email address              |
| full_name    | varchar(255)   | NOT NULL          | User's full name                  |
| avatar_url   | varchar(255)   |                   | URL to user's profile picture     |
| phone_number | varchar(20)    |                   | User's phone number               |
| created_at   | timestamptz    | NOT NULL, DEFAULT | Record creation timestamp         |
| updated_at   | timestamptz    | NOT NULL, DEFAULT | Record last update timestamp      |

### user_profiles

The `user_profiles` table stores additional user information.

| Column        | Type           | Constraints       | Description                       |
|---------------|----------------|-------------------|-----------------------------------|
| id            | uuid           | PK                | Unique identifier                 |
| user_id       | uuid           | FK, NOT NULL      | Reference to users.id             |
| bio           | text           |                   | User's biography                  |
| location      | varchar(255)   |                   | User's location                   |
| preferences   | jsonb          | DEFAULT '{}'      | User preferences as JSON          |
| created_at    | timestamptz    | NOT NULL, DEFAULT | Record creation timestamp         |
| updated_at    | timestamptz    | NOT NULL, DEFAULT | Record last update timestamp      |

### organizations

The `organizations` table stores organization information.

| Column     | Type           | Constraints       | Description                       |
|------------|----------------|-------------------|-----------------------------------|
| id         | uuid           | PK                | Unique identifier                 |
| name       | varchar(255)   | NOT NULL          | Organization name                 |
| slug       | varchar(255)   | UNIQUE, NOT NULL  | URL-friendly identifier           |
| logo_url   | varchar(255)   |                   | URL to organization logo          |
| created_at | timestamptz    | NOT NULL, DEFAULT | Record creation timestamp         |
| updated_at | timestamptz    | NOT NULL, DEFAULT | Record last update timestamp      |

### roles

The `roles` table stores role definitions for organizations.

| Column          | Type           | Constraints       | Description                       |
|-----------------|----------------|-------------------|-----------------------------------|
| id              | uuid           | PK                | Unique identifier                 |
| name            | varchar(100)   | NOT NULL          | Role name                         |
| organization_id | uuid           | FK, NOT NULL      | Reference to organizations.id     |
| permissions     | jsonb          | DEFAULT '{}'      | Role permissions as JSON          |
| created_at      | timestamptz    | NOT NULL, DEFAULT | Record creation timestamp         |
| updated_at      | timestamptz    | NOT NULL, DEFAULT | Record last update timestamp      |

### members

The `members` table stores organization membership information.

| Column          | Type           | Constraints       | Description                       |
|-----------------|----------------|-------------------|-----------------------------------|
| id              | uuid           | PK                | Unique identifier                 |
| organization_id | uuid           | FK, NOT NULL      | Reference to organizations.id     |
| user_id         | uuid           | FK, NOT NULL      | Reference to users.id             |
| role_id         | uuid           | FK, NOT NULL      | Reference to roles.id             |
| created_at      | timestamptz    | NOT NULL, DEFAULT | Record creation timestamp         |
| updated_at      | timestamptz    | NOT NULL, DEFAULT | Record last update timestamp      |

### invitations

The `invitations` table stores organization invitations.

| Column          | Type           | Constraints       | Description                       |
|-----------------|----------------|-------------------|-----------------------------------|
| id              | uuid           | PK                | Unique identifier                 |
| email           | varchar(255)   | NOT NULL          | Invitee's email address           |
| organization_id | uuid           | FK, NOT NULL      | Reference to organizations.id     |
| role_id         | uuid           | FK, NOT NULL      | Reference to roles.id             |
| token           | varchar(255)   | UNIQUE, NOT NULL  | Invitation token                  |
| expires_at      | timestamptz    | NOT NULL          | Invitation expiration timestamp   |
| invited_by_id   | uuid           | FK                | Reference to users.id             |
| created_at      | timestamptz    | NOT NULL, DEFAULT | Record creation timestamp         |

## Indexes

| Table        | Index Name                  | Columns                | Type      | Description                       |
|--------------|-----------------------------|-----------------------|-----------|-----------------------------------|
| users        | users_email_idx             | email                 | UNIQUE    | Fast lookup by email              |
| user_profiles| user_profiles_user_id_idx   | user_id               | UNIQUE    | Fast lookup by user_id            |
| organizations| organizations_slug_idx      | slug                  | UNIQUE    | Fast lookup by slug               |
| roles        | roles_org_name_idx          | organization_id, name | UNIQUE    | Unique role names per organization|
| members      | members_org_user_idx        | organization_id, user_id | UNIQUE | Unique membership per organization|
| invitations  | invitations_token_idx       | token                 | UNIQUE    | Fast lookup by token              |
| invitations  | invitations_org_email_idx   | organization_id, email| UNIQUE    | Unique invitation per email       |

## Prisma Migration Strategy

We use Prisma Migrate for database migrations, following these best practices:

### Migration Workflow

1. **Make Schema Changes**: Update the `prisma/schema.prisma` file with your changes.

2. **Generate Migration Files**: Create a new migration with a descriptive name:
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

3. **Review Migration Files**: Carefully review the generated SQL in the `prisma/migrations` directory.

4. **Apply Migrations in Development**: Migrations are automatically applied when generated.

5. **Apply Migrations in Production**: Use the following command in production:
   ```bash
   npx prisma migrate deploy
   ```

### Migration Best Practices

1. **Descriptive Names**: Use clear, descriptive names for migrations (e.g., `add_organization_slug_field`).

2. **Small, Focused Migrations**: Create small, focused migrations that do one thing well.

3. **Version Control**: Commit migration files to version control.

4. **Never Edit Existing Migrations**: Once a migration is applied, never edit it. Create a new migration instead.

5. **Test Migrations**: Test migrations in development and staging environments before applying to production.

6. **Backup Before Migrating**: Always backup the database before applying migrations in production.

7. **Rollback Plan**: Have a rollback plan for each migration.

### Migration Directory Structure

```
prisma/
├── schema.prisma        # Prisma schema file
├── migrations/          # Migration files
│   ├── 20230101000000_initial_schema/
│   │   ├── migration.sql
│   │   └── README.md    # Optional documentation for complex migrations
│   ├── 20230102000000_add_organization_slug/
│   │   └── migration.sql
│   └── ...
└── seed.ts              # Database seeding script
```

## Initial Data

Initial data is provided through Prisma's seeding mechanism in `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

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
      // The password is 'Password123!'
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

  const memberRole = await prisma.role.upsert({
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
```

To run the seed:

```bash
npx prisma db seed
```

## Integration with Supabase

While we use Prisma for database schema management and migrations, we still leverage Supabase for:

1. **Authentication**: User authentication and session management
2. **Row-Level Security**: Security policies for data access control
3. **Storage**: File storage for documents and media

The Prisma schema is synchronized with Supabase using the following approach:

1. Define the schema in Prisma
2. Generate migrations with Prisma Migrate
3. Apply migrations to the Supabase database
4. Configure Row-Level Security policies in Supabase

## Row-Level Security Policies

Row-Level Security policies are applied directly to the Supabase database through migrations:

### users Table

```sql
-- Users can only view and update their own data
CREATE POLICY users_policy ON users
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

### user_profiles Table

```sql
-- Users can only view and update their own profile
CREATE POLICY user_profiles_policy ON user_profiles
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### organizations Table

```sql
-- Users can view organizations they are members of
CREATE POLICY organizations_select_policy ON organizations
    USING (EXISTS (
        SELECT 1 FROM members 
        WHERE members.organization_id = id 
        AND members.user_id = auth.uid()
    ));

-- Only organization admins can update organizations
CREATE POLICY organizations_update_policy ON organizations
    USING (EXISTS (
        SELECT 1 FROM members 
        JOIN roles ON members.role_id = roles.id
        WHERE members.organization_id = id 
        AND members.user_id = auth.uid()
        AND roles.permissions->>'organizations'->>'update' = 'true'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM members 
        JOIN roles ON members.role_id = roles.id
        WHERE members.organization_id = id 
        AND members.user_id = auth.uid()
        AND roles.permissions->>'organizations'->>'update' = 'true'
    ));
```

### members Table

```sql
-- Users can view members of organizations they belong to
CREATE POLICY members_select_policy ON members
    USING (EXISTS (
        SELECT 1 FROM members AS m
        WHERE m.organization_id = organization_id 
        AND m.user_id = auth.uid()
    ));

-- Only organization admins can manage members
CREATE POLICY members_manage_policy ON members
    USING (EXISTS (
        SELECT 1 FROM members AS m
        JOIN roles ON m.role_id = roles.id
        WHERE m.organization_id = organization_id 
        AND m.user_id = auth.uid()
        AND roles.permissions->>'members'->>'update' = 'true'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM members AS m
        JOIN roles ON m.role_id = roles.id
        WHERE members.organization_id = organization_id 
        AND m.user_id = auth.uid()
        AND roles.permissions->>'members'->>'update' = 'true'
    ));
```

### roles Table

```sql
-- Users can view roles of organizations they belong to
CREATE POLICY roles_select_policy ON roles
    USING (EXISTS (
        SELECT 1 FROM members
        WHERE members.organization_id = organization_id 
        AND members.user_id = auth.uid()
    ));

-- Only organization admins can manage roles
CREATE POLICY roles_manage_policy ON roles
    USING (EXISTS (
        SELECT 1 FROM members
        JOIN roles AS r ON members.role_id = r.id
        WHERE members.organization_id = organization_id 
        AND members.user_id = auth.uid()
        AND r.permissions->>'roles'->>'update' = 'true'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM members
        JOIN roles AS r ON members.role_id = r.id
        WHERE members.organization_id = organization_id 
        AND members.user_id = auth.uid()
        AND r.permissions->>'roles'->>'update' = 'true'
    ));
```

### invitations Table

```sql
-- Users can view invitations of organizations they are admins of
CREATE POLICY invitations_select_policy ON invitations
    USING (EXISTS (
        SELECT 1 FROM members
        JOIN roles ON members.role_id = roles.id
        WHERE members.organization_id = organization_id 
        AND members.user_id = auth.uid()
        AND roles.permissions->>'invitations'->>'read' = 'true'
    ));

-- Only organization admins can manage invitations
CREATE POLICY invitations_manage_policy ON invitations
    USING (EXISTS (
        SELECT 1 FROM members
        JOIN roles ON members.role_id = roles.id
        WHERE members.organization_id = organization_id 
        AND members.user_id = auth.uid()
        AND roles.permissions->>'invitations'->>'create' = 'true'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM members
        JOIN roles ON members.role_id = roles.id
        WHERE members.organization_id = organization_id 
        AND members.user_id = auth.uid()
        AND roles.permissions->>'invitations'->>'create' = 'true'
    ));
```

## Database Access in Application Code

In the application code, we use Prisma Client for type-safe database access:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example: Get all organizations for a user
async function getUserOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
          role: true,
        },
      },
    },
  });
}

// Example: Create a new organization and add the creator as an admin
async function createOrganization(data: {
  name: string;
  slug: string;
  logoUrl?: string;
  creatorId: string;
}) {
  const { name, slug, logoUrl, creatorId } = data;
  
  return prisma.$transaction(async (tx) => {
    // Create the organization
    const organization = await tx.organization.create({
      data: {
        name,
        slug,
        logoUrl,
      },
    });
    
    // Create admin role
    const adminRole = await tx.role.create({
      data: {
        name: 'Admin',
        organizationId: organization.id,
        permissions: {
          users: { create: true, read: true, update: true, delete: true },
          organizations: { create: true, read: true, update: true, delete: true },
          members: { create: true, read: true, update: true, delete: true },
          invitations: { create: true, read: true, update: true, delete: true },
        },
      },
    });
    
    // Add creator as admin
    await tx.member.create({
      data: {
        organizationId: organization.id,
        userId: creatorId,
        roleId: adminRole.id,
      },
    });
    
    return organization;
  });
}

// Example: Create an invitation
async function createInvitation(data: {
  email: string;
  organizationId: string;
  roleId: string;
  invitedById: string;
}) {
  const { email, organizationId, roleId, invitedById } = data;
  
  // Generate a unique token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  return prisma.invitation.create({
    data: {
      email,
      organizationId,
      roleId,
      invitedById,
      token,
      expiresAt,
    },
  });
}
```

## Conclusion

This database schema provides a solid foundation for the Afino platform's core scaffolding features. By using Prisma for schema management and migrations, we ensure type safety, maintainability, and a robust migration strategy. The integration with Supabase allows us to leverage its authentication, authorization, and storage capabilities while maintaining full control over our database schema. 