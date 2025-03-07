# Feature Plan: User Invitation Flow

## Overview

This feature implements the user invitation flow for the Afino platform, allowing organization administrators to invite new users to join their organization with specific roles. The flow includes sending invitation emails, tracking invitation status, and handling the acceptance process.

## User Stories

- As an organization admin, I want to invite new users to my organization so they can collaborate
- As an organization admin, I want to assign specific roles to invited users
- As an organization admin, I want to track the status of sent invitations
- As an organization admin, I want to resend invitations if needed
- As an organization admin, I want to cancel pending invitations
- As an invited user, I want to receive an email invitation to join an organization
- As an invited user, I want to accept an invitation and join the organization
- As an invited user, I want to decline an invitation if I choose not to join

## Requirements

### Functional Requirements

- Interface for admins to invite users by email
- Role selection for invited users
- Email notifications for invitations
- Unique invitation links with secure tokens
- Invitation acceptance and decline functionality
- Invitation status tracking (Pending, Accepted, Declined, Expired)
- Ability to resend invitations
- Ability to cancel pending invitations
- Automatic member creation upon invitation acceptance
- Handling of invitations for existing vs. new users

### Non-Functional Requirements

- Secure invitation tokens with expiration
- Responsive design for invitation interfaces
- Accessibility compliance (WCAG 2.1 AA)
- Email deliverability optimization
- Rate limiting for invitation sending

## UI/UX Design

- Clean, intuitive invitation form
- Role selection dropdown with clear descriptions
- Invitation management table with status indicators
- Clear invitation email design with prominent action buttons
- Smooth onboarding flow for invited users
- Success/error messages for all invitation actions

## Technical Implementation

### Components

- `InviteUserForm`: Form component for inviting users
- `InvitationsList`: Component for displaying and managing sent invitations
- `InvitationActions`: Component for resending or canceling invitations
- `AcceptInvitationPage`: Page for handling invitation acceptance
- `DeclineInvitationPage`: Page for handling invitation decline

### Database Changes

No additional database changes are required as the Invitation model is already defined in our Prisma schema:

```prisma
model Invitation {
  id             String         @id @default(uuid())
  email          String
  organizationId String         @map("organization_id")
  roleId         String         @map("role_id")
  token          String         @unique
  status         String         @default("pending") // pending, accepted, declined, expired
  expiresAt      DateTime       @map("expires_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  
  // Relations
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  role           Role           @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@unique([organizationId, email])
  @@map("invitations")
}
```

### API Endpoints

We'll create the following API endpoints:

- `POST /api/organizations/:id/invitations`: Create a new invitation
- `GET /api/organizations/:id/invitations`: List all invitations for an organization
- `DELETE /api/organizations/:id/invitations/:invitationId`: Cancel an invitation
- `POST /api/organizations/:id/invitations/:invitationId/resend`: Resend an invitation
- `GET /api/invitations/:token`: Verify an invitation token
- `POST /api/invitations/:token/accept`: Accept an invitation
- `POST /api/invitations/:token/decline`: Decline an invitation

### Email Templates

- Invitation email with organization details, inviter information, and action buttons
- Invitation acceptance confirmation email
- Invitation reminder email

### Authentication/Authorization

- Require admin role to invite users
- Secure invitation tokens with proper expiration
- Verify organization membership before allowing invitations
- Handle authentication for new vs. existing users during acceptance

## Testing Strategy

### Unit Tests

- Test invitation form validation
- Test invitation token generation
- Test invitation status management
- Test email template rendering

### Integration Tests

- Test invitation creation flow
- Test invitation acceptance flow
- Test invitation decline flow
- Test invitation cancellation
- Test invitation resending

### End-to-End Tests

- Complete invitation and acceptance process
- Test expiration handling
- Test email delivery
- Test member creation upon acceptance

## Dependencies

- Nodemailer or SendGrid for email delivery
- Zod for form validation
- React Hook Form for form state management
- Prisma Client for database operations
- Shadcn UI components for UI elements
- JWT or similar for secure invitation tokens

## Implementation Plan

1. Create invitation form and management interface
2. Set up invitation token generation and verification
3. Implement email templates and delivery system
4. Create API endpoints for invitation management
5. Implement invitation acceptance and decline flows
6. Add member creation upon invitation acceptance
7. Implement invitation status tracking
8. Add resend and cancel functionality
9. Test the entire invitation flow

## Acceptance Criteria

- Organization admins can successfully invite users by email
- Invited users receive properly formatted email invitations
- Invitation tokens are secure and have proper expiration
- Users can accept invitations and are added as organization members
- Users can decline invitations
- Admins can view invitation status
- Admins can resend invitations
- Admins can cancel pending invitations
- The system handles edge cases (expired invitations, already members, etc.)

## Timeline

- Estimated time for implementation: 3-4 days
- Key milestones:
  - Day 1: Create invitation form and token generation
  - Day 2: Implement email system and API endpoints
  - Day 3: Add acceptance/decline flows and member creation
  - Day 4: Implement invitation management and testing 