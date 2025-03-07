# User Onboarding Implementation Plan

## Overview

This feature plan outlines the implementation of user onboarding flows for the Afino platform. The goal is to create a seamless experience for new users, automatically creating user profiles, handling organization creation and membership based on email domains.

## User Stories

1. As a new user, I want my profile to be automatically created with information from my Google account so I don't have to manually enter my details.
2. As a new user with a unique email domain, I want to be prompted to create a new organization for my domain.
3. As a new user with an email domain that matches an existing organization, I want to be prompted to join that organization.

## Implementation Steps

### 1. Database Schema Updates

#### Prisma Schema Updates

We need to create the following models:
- `User` (extending Supabase Auth)
- `Organization`
- `UserOrganization` (for many-to-many relationship)
- `Role` (for role-based access control)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  firstName     String?
  lastName      String?
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  organizations UserOrganization[]
}

model Organization {
  id          String   @id @default(uuid())
  name        String
  domain      String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       UserOrganization[]
}

model UserOrganization {
  id             String       @id @default(uuid())
  userId         String
  organizationId String
  roleId         String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  user           User         @relation(fields: [userId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])
  role           Role         @relation(fields: [roleId], references: [id])

  @@unique([userId, organizationId])
}

model Role {
  id               String             @id @default(uuid())
  name             String
  permissions      String[]
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  userOrganizations UserOrganization[]
}
```

### 2. User Profile Creation

#### Service Layer

Create a service to handle user profile creation:

```typescript
// services/userService.ts
export async function createUserProfile(supabaseUser: User) {
  // Extract user data from Supabase Auth
  const { id, email, user_metadata } = supabaseUser;
  
  // Create user in our database
  const user = await prisma.user.create({
    data: {
      id,
      email,
      name: user_metadata.full_name,
      firstName: user_metadata.first_name,
      lastName: user_metadata.last_name,
      avatarUrl: user_metadata.avatar_url,
    },
  });
  
  return user;
}
```

#### Auth Callback Enhancement

Enhance the auth callback to check if the user exists and create a profile if not:

```typescript
// app/auth/callback/route.ts
// After successful authentication
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // Check if user exists in our database
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });
  
  if (!existingUser) {
    // New user - create profile
    await createUserProfile(user);
    
    // Redirect to onboarding flow
    return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
  }
  
  // Existing user - redirect to dashboard
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
```

### 3. Organization Management

#### Domain Extraction Utility

```typescript
// utils/domainUtils.ts
export function extractDomain(email: string): string | null {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : null;
}
```

#### Organization Service

```typescript
// services/organizationService.ts
export async function findOrganizationByDomain(domain: string) {
  return prisma.organization.findUnique({
    where: { domain },
  });
}

export async function createOrganization(name: string, domain: string | null) {
  return prisma.organization.create({
    data: {
      name,
      domain,
    },
  });
}

export async function addUserToOrganization(userId: string, organizationId: string, roleId: string) {
  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId,
      roleId,
    },
  });
}
```

#### Role Service

```typescript
// services/roleService.ts
export async function getOrCreateAdminRole() {
  let adminRole = await prisma.role.findFirst({
    where: { name: 'Admin' },
  });
  
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        permissions: ['manage_users', 'manage_organization', 'manage_roles'],
      },
    });
  }
  
  return adminRole;
}

export async function getOrCreateMemberRole() {
  let memberRole = await prisma.role.findFirst({
    where: { name: 'Member' },
  });
  
  if (!memberRole) {
    memberRole = await prisma.role.create({
      data: {
        name: 'Member',
        permissions: ['view_organization'],
      },
    });
  }
  
  return memberRole;
}
```

### 4. Onboarding Flow UI

#### Onboarding Page

Create an onboarding page that:
1. Displays user information from Google Auth
2. Checks if the user's domain matches an existing organization
3. Either prompts to join the existing organization or create a new one

```typescript
// app/onboarding/page.tsx
export default function OnboardingPage() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState('');
  const [existingOrganization, setExistingOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkOrganization() {
      if (user?.email) {
        const domain = extractDomain(user.email);
        if (domain) {
          const org = await findOrganizationByDomain(domain);
          setExistingOrganization(org);
          if (!org) {
            // Suggest organization name based on domain
            setOrganizationName(domain.split('.')[0]);
          }
        }
        setIsLoading(false);
      }
    }
    
    checkOrganization();
  }, [user]);
  
  // Render appropriate UI based on existingOrganization
}
```

#### Create Organization Form

```typescript
// components/onboarding/CreateOrganizationForm.tsx
export function CreateOrganizationForm({ 
  suggestedName, 
  userEmail, 
  onSubmit 
}) {
  const [name, setName] = useState(suggestedName);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Your Organization</h2>
      <p>We'll create an organization based on your email domain: {extractDomain(userEmail)}</p>
      
      <div>
        <label>Organization Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>
      
      <button type="submit">Create Organization</button>
    </form>
  );
}
```

#### Join Organization Form

```typescript
// components/onboarding/JoinOrganizationForm.tsx
export function JoinOrganizationForm({ 
  organization, 
  onJoin, 
  onDecline 
}) {
  return (
    <div>
      <h2>Join Existing Organization</h2>
      <p>We found an organization matching your email domain:</p>
      <div>
        <strong>{organization.name}</strong>
      </div>
      
      <div>
        <button onClick={onJoin}>Join Organization</button>
        <button onClick={onDecline}>Not Now</button>
      </div>
    </div>
  );
}
```

### 5. API Routes for Onboarding Actions

#### Create Organization API

```typescript
// app/api/organizations/route.ts
export async function POST(request: Request) {
  const { name, domain } = await request.json();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Create organization
  const organization = await createOrganization(name, domain);
  
  // Get admin role
  const adminRole = await getOrCreateAdminRole();
  
  // Add user to organization as admin
  await addUserToOrganization(user.id, organization.id, adminRole.id);
  
  return NextResponse.json({ organization });
}
```

#### Join Organization API

```typescript
// app/api/organizations/join/route.ts
export async function POST(request: Request) {
  const { organizationId } = await request.json();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get member role
  const memberRole = await getOrCreateMemberRole();
  
  // Add user to organization as member
  await addUserToOrganization(user.id, organizationId, memberRole.id);
  
  return NextResponse.json({ success: true });
}
```

### 6. Testing Strategy

#### Unit Tests

1. **Domain Extraction**:
   - Test extracting domains from various email formats
   - Test handling invalid emails

2. **User Service**:
   - Test creating a user profile from Supabase Auth data
   - Test handling missing user metadata

3. **Organization Service**:
   - Test finding organizations by domain
   - Test creating new organizations
   - Test adding users to organizations

#### Integration Tests

1. **Onboarding Flow**:
   - Test the complete flow for a new user with a new domain
   - Test the flow for a user with an existing organization domain

2. **API Routes**:
   - Test organization creation API
   - Test organization joining API
   - Test authentication requirements

#### End-to-End Tests

1. **Google Auth to Onboarding**:
   - Test the complete flow from Google Auth to onboarding
   - Test organization creation and joining

## Implementation Timeline

1. **Database Schema Setup**: 1 day
2. **User Profile Creation**: 1 day
3. **Organization Management Services**: 1 day
4. **Onboarding UI**: 2 days
5. **API Routes**: 1 day
6. **Testing**: 2 days

Total: 8 days

## Dependencies

- Prisma ORM
- Supabase Auth
- Next.js App Router
- React Hook Form (for forms)
- Jest (for testing)
- React Testing Library (for component tests)

## Acceptance Criteria

1. New users have profiles automatically created with Google Auth data
2. Users with new domains are prompted to create an organization
3. Users with existing organization domains are prompted to join
4. All flows are properly tested with unit, integration, and E2E tests
5. The UI is responsive and user-friendly
6. Error handling is robust and user-friendly 