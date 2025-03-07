# Feature Plan: User Profile Settings

## Overview

This feature implements the user profile settings for the Afino platform, allowing users to view and update their personal information, manage their account settings, and customize their experience on the platform.

## User Stories

- As a user, I want to view my profile information so I can verify it's correct
- As a user, I want to update my personal details so my information stays current
- As a user, I want to change my password to maintain account security
- As a user, I want to upload or change my profile picture to personalize my account
- As a user, I want to manage my notification preferences
- As a user, I want to view my organization memberships

## Requirements

### Functional Requirements

- Profile information display (name, email, profile picture)
- Personal information editing (first name, last name, job title)
- Password change functionality
- Profile picture upload and management
- Notification preferences management
- Organization membership list
- Account deletion option

### Non-Functional Requirements

- Responsive design for all screen sizes
- Accessibility compliance (WCAG 2.1 AA)
- Fast loading profile page
- Secure handling of personal information
- Cross-browser compatibility

## UI/UX Design

- Clean, organized profile settings page with tabs or sections
- Profile picture upload with preview and cropping functionality
- Form validation with clear error messages
- Success notifications for saved changes
- Confirmation dialogs for sensitive actions (password change, account deletion)
- Consistent styling with the rest of the application

## Technical Implementation

### Components

- `ProfilePage`: Container page for profile settings
- `ProfileHeader`: Component displaying user's name, picture, and basic info
- `PersonalInfoForm`: Form for editing personal details
- `PasswordChangeForm`: Form for changing password
- `ProfilePictureUploader`: Component for uploading and cropping profile pictures
- `NotificationSettings`: Component for managing notification preferences
- `OrganizationsList`: Component displaying user's organization memberships
- `AccountDeletionSection`: Component for account deletion functionality

### Database Changes

No additional database changes are required as the User and Profile models are already defined in our Prisma schema:

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  emailVerified     DateTime? @map("email_verified")
  password          String?
  firstName         String?   @map("first_name")
  lastName          String?   @map("last_name")
  profilePictureUrl String?   @map("profile_picture_url")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  // Relations
  profile           Profile?
  members           Member[]

  @@map("users")
}

model Profile {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  jobTitle           String?  @map("job_title")
  bio                String?
  notificationPrefs  Json     @default("{}") @map("notification_prefs")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  
  // Relations
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}
```

### API Endpoints

We'll create the following API endpoints:

- `GET /api/user/profile`: Get the current user's profile
- `PUT /api/user/profile`: Update the user's profile information
- `PUT /api/user/password`: Change the user's password
- `POST /api/user/profile-picture`: Upload a new profile picture
- `DELETE /api/user/profile-picture`: Remove the profile picture
- `PUT /api/user/notification-preferences`: Update notification preferences
- `GET /api/user/organizations`: Get the user's organization memberships
- `DELETE /api/user/account`: Delete the user's account

### Authentication/Authorization

- All profile endpoints require authentication
- Password change requires current password verification
- Account deletion requires password verification

## Testing Strategy

### Unit Tests

- Test form validation logic
- Test profile picture upload component
- Test notification preferences component
- Test password change validation

### Integration Tests

- Test profile information update flow
- Test password change flow
- Test profile picture upload and removal
- Test notification preferences update

### End-to-End Tests

- Complete profile update process
- Password change process
- Profile picture upload process
- Account settings management

## Dependencies

- Supabase Storage for profile picture uploads
- Zod for form validation
- React Hook Form for form state management
- Prisma Client for database operations
- Shadcn UI components for UI elements
- React Cropper or similar for image cropping

## Implementation Plan

1. Create profile page layout with sections/tabs
2. Implement personal information form
3. Create password change functionality
4. Set up profile picture upload with cropping
5. Implement notification preferences management
6. Create organization memberships list
7. Add account deletion functionality
8. Test all profile features

## Acceptance Criteria

- Users can view their profile information
- Users can update their personal details (name, job title, bio)
- Users can change their password securely
- Users can upload, crop, and remove profile pictures
- Users can manage their notification preferences
- Users can view their organization memberships
- Users can delete their account
- All forms have proper validation and error handling
- Success messages are displayed after successful actions

## Timeline

- Estimated time for implementation: 2-3 days
- Key milestones:
  - Day 1: Create profile page layout and personal information form
  - Day 2: Implement password change and profile picture functionality
  - Day 3: Add notification preferences, organization list, and account deletion 