# Feature Plan: Role Management

## Overview

This feature implements the role management system for the Afino platform, allowing organization administrators to create, edit, and manage roles with specific permissions. This system will control what actions members can perform within an organization.

## User Stories

- As an organization admin, I want to view all roles in my organization
- As an organization admin, I want to create new roles with specific permissions
- As an organization admin, I want to edit existing role permissions
- As an organization admin, I want to delete roles that are no longer needed
- As an organization admin, I want to assign roles to organization members
- As an organization admin, I want to view which members have which roles
- As an organization member, I want to view my role and permissions

## Requirements

### Functional Requirements

- Role listing interface for organization admins
- Role creation form with permission selection
- Role editing functionality
- Role deletion with validation (prevent deletion of in-use roles)
- Default roles (Admin, Member) that cannot be deleted
- Permission management system with granular controls
- Member role assignment interface
- Role information display for members

### Non-Functional Requirements

- Responsive design for all screen sizes
- Accessibility compliance (WCAG 2.1 AA)
- Fast loading role management pages
- Intuitive permission selection interface
- Cross-browser compatibility

## UI/UX Design

- Clean, organized role management page
- Role cards or table with key information
- Permission selection interface with categories
- Clear visual indicators for default/system roles
- Confirmation dialogs for sensitive actions (deletion)
- Success notifications for saved changes
- Error messages for validation failures
- Consistent styling with the rest of the application

## Technical Implementation

### Components

- `RolesPage`: Container page for role management
- `RolesList`: Component for displaying all roles
- `RoleCard`: Component for displaying a single role
- `CreateRoleForm`: Form for creating a new role
- `EditRoleForm`: Form for editing an existing role
- `PermissionSelector`: Component for selecting role permissions
- `MemberRoleAssignment`: Component for assigning roles to members
- `RoleInfoDisplay`: Component for displaying role information to members

### Database Changes

No additional database changes are required as the Role model is already defined in our Prisma schema:

```prisma
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
```

### Permission System

We'll implement a permission system with the following structure:

```typescript
type Permission = {
  resource: string;  // e.g., 'members', 'settings', 'billing'
  action: string;    // e.g., 'create', 'read', 'update', 'delete'
};

type Permissions = {
  [key: string]: boolean;  // e.g., 'members:create': true
};
```

Default permissions will be:

- Admin: All permissions
- Member: Limited read permissions

### API Endpoints

We'll create the following API endpoints:

- `GET /api/organizations/:id/roles`: Get all roles for an organization
- `POST /api/organizations/:id/roles`: Create a new role
- `GET /api/organizations/:id/roles/:roleId`: Get a specific role
- `PUT /api/organizations/:id/roles/:roleId`: Update a role
- `DELETE /api/organizations/:id/roles/:roleId`: Delete a role
- `GET /api/organizations/:id/members`: Get all members with their roles
- `PUT /api/organizations/:id/members/:memberId/role`: Update a member's role

### Authentication/Authorization

- Require admin role to manage roles
- Verify organization membership before allowing role management
- Prevent deletion of default roles
- Prevent deletion of roles assigned to members
- Ensure users can only view their own permissions

## Testing Strategy

### Unit Tests

- Test role form validation
- Test permission selector component
- Test role card/display components
- Test permission checking utilities

### Integration Tests

- Test role creation flow
- Test role editing flow
- Test role deletion flow
- Test member role assignment

### End-to-End Tests

- Complete role management process
- Test permission enforcement
- Test default role protection
- Test member role assignment and effects

## Dependencies

- Zod for form validation
- React Hook Form for form state management
- Prisma Client for database operations
- Shadcn UI components for UI elements
- React Query for data fetching and caching

## Implementation Plan

1. Create role management page layout
2. Implement role listing functionality
3. Create role creation form with permission selection
4. Implement role editing functionality
5. Add role deletion with validation
6. Create member role assignment interface
7. Implement permission checking utilities
8. Test all role management features

## Acceptance Criteria

- Organization admins can view all roles
- Organization admins can create new roles with specific permissions
- Organization admins can edit existing role permissions
- Organization admins can delete roles that are not in use
- Default roles (Admin, Member) cannot be deleted
- Organization admins can assign roles to members
- Members can view their own role and permissions
- All forms have proper validation and error handling
- Success messages are displayed after successful actions
- Error messages are displayed for validation failures

## Timeline

- Estimated time for implementation: 2-3 days
- Key milestones:
  - Day 1: Create role listing and creation functionality
  - Day 2: Implement role editing, deletion, and permission system
  - Day 3: Add member role assignment and testing 