# Feature Plan: Organization Creation

## Overview

This feature implements the organization creation flow for the Afino platform, allowing users to create new organizations, set up basic organization details, and become the initial admin of the organization.

## User Stories

- As a new user, I want to create an organization so that I can start using the platform
- As an existing user, I want to create additional organizations so that I can manage different entities
- As an organization creator, I want to set up basic organization details so that the organization is properly identified
- As an organization creator, I want to automatically become an admin of the organization I create

## Requirements

### Functional Requirements

- Form for creating a new organization with name and optional logo
- Automatic generation of a URL-friendly slug from the organization name
- Validation for organization name and slug uniqueness
- Automatic assignment of the creator as an admin of the organization
- Creation of default roles (Admin, Member) for the organization
- Redirect to organization dashboard after successful creation
- Error handling for creation failures

### Non-Functional Requirements

- Fast organization creation process
- Responsive design for the organization creation form
- Accessibility compliance (WCAG 2.1 AA)
- Cross-browser compatibility

## UI/UX Design

- Clean, minimal organization creation form
- Logo upload with preview
- Clear error messages for validation failures
- Loading state during organization creation
- Success message after organization creation
- Consistent styling with the rest of the application

## Technical Implementation

### Components

- `OrganizationCreationForm`: Form component for creating a new organization
- `LogoUploader`: Component for uploading and previewing the organization logo
- `SlugGenerator`: Component for generating and validating a URL-friendly slug
- `OrganizationCreationSuccess`: Component to display success message

### Database Changes

No additional database changes are required as the Organization, Role, and Member models are already defined in our Prisma schema:

```prisma
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
```

### API Endpoints

We'll create the following API endpoints:

- `POST /api/organizations`: Create a new organization
- `GET /api/organizations/check-slug/:slug`: Check if a slug is available
- `POST /api/organizations/:id/logo`: Upload organization logo

### Authentication/Authorization

- Require authentication to create an organization
- Verify user is authenticated before allowing organization creation
- Set up appropriate permissions for the organization creator

## Testing Strategy

### Unit Tests

- Test form validation logic
- Test slug generation and validation
- Test logo upload component
- Test form submission handlers
- Test error handling

### Integration Tests

- Test organization creation flow
- Test role creation for new organizations
- Test member assignment for the creator

### End-to-End Tests

- Complete organization creation process
- Verify creator is assigned as admin
- Verify redirect to organization dashboard

## Dependencies

- Supabase Storage for logo uploads
- Zod for form validation
- React Hook Form for form state management
- Prisma Client for database operations
- Shadcn UI components for UI elements

## Implementation Plan

1. Create organization creation page and form
2. Implement slug generation and validation
3. Set up logo upload functionality
4. Create API endpoint for organization creation
5. Implement role and member creation for new organizations
6. Add error handling and success messages
7. Set up redirect to organization dashboard
8. Test the entire organization creation flow

## Acceptance Criteria

- Users can successfully create a new organization with a name and optional logo
- A unique slug is generated for the organization
- The creator is automatically assigned as an admin of the organization
- Default roles (Admin, Member) are created for the organization
- Users are redirected to the organization dashboard after successful creation
- Form validation prevents submission of invalid data
- Error messages are displayed for creation failures
- Success message is displayed after successful creation

## Timeline

- Estimated time for implementation: 2-3 days
- Key milestones:
  - Day 1: Create organization creation form and slug validation
  - Day 2: Implement logo upload and API endpoint
  - Day 3: Add role/member creation and testing 