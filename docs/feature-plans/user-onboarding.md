# User Onboarding Flow

## Overview

The user onboarding flow is a critical part of the Afino platform that guides new users through the process of setting up their account and joining or creating an organization. This document outlines the implementation details, user journey, and technical components of the onboarding process.

## User Journey

1. **Authentication**: User signs in using Google OAuth
2. **Profile Creation**: System creates a user profile using data from Google
3. **Organization Detection**: System checks if the user's email domain matches an existing organization
4. **Organization Decision**:
   - If a matching organization exists, user is prompted to join it
   - If no matching organization exists, user is prompted to create a new one
   - User can also skip organization setup for now
5. **Dashboard Access**: User is redirected to the dashboard after completing or skipping organization setup

## Technical Implementation

### Database Schema

The onboarding flow relies on the following database models:

- **User**: Stores user profile information
- **Organization**: Represents a company or team
- **UserOrganization**: Junction table for user-organization relationships with roles
- **Role**: Defines permissions for users within organizations

### Components

1. **Auth Callback Handler** (`src/app/auth/callback/route.ts`)
   - Processes OAuth callback from Google
   - Creates user profile if it doesn't exist
   - Redirects to onboarding page for new users

2. **Onboarding Page** (`src/app/onboarding/page.tsx`)
   - Checks for existing organizations matching the user's email domain
   - Provides UI for creating or joining an organization
   - Handles form submission and API calls

3. **Domain Utilities** (`src/utils/domainUtils.ts`)
   - Extracts domain from email addresses
   - Suggests organization names based on domains
   - Validates email formats

4. **API Routes**
   - `/api/organizations/domain/[domain]`: Checks if an organization exists for a domain
   - `/api/organizations`: Creates a new organization
   - `/api/organizations/join`: Adds a user to an existing organization

5. **Service Layer**
   - `userService.ts`: Handles user profile creation and management
   - `organizationService.ts`: Manages organization creation and user-organization relationships
   - `roleService.ts`: Manages role assignment and permissions

## User Flows

### New User with New Domain

1. User signs in with Google
2. System creates user profile
3. System redirects to onboarding page
4. System suggests organization name based on email domain
5. User creates organization and becomes admin
6. User is redirected to dashboard

### New User with Existing Domain

1. User signs in with Google
2. System creates user profile
3. System redirects to onboarding page
4. System detects existing organization for email domain
5. User joins organization as member
6. User is redirected to dashboard

### Returning User

1. User signs in with Google
2. System detects existing user profile
3. User is redirected directly to dashboard

## Testing Strategy

- **Unit Tests**: Test domain utilities and service functions
- **Integration Tests**: Test API routes and database interactions
- **End-to-End Tests**: Test complete user journey through the onboarding flow

## Future Enhancements

1. **Email Verification**: Add email verification step for non-Google sign-ups
2. **Organization Invitations**: Allow users to be invited to organizations
3. **Multi-Organization Support**: Allow users to belong to multiple organizations
4. **Custom Onboarding Steps**: Add organization-specific onboarding steps
5. **Role Selection**: Allow organization admins to select roles for new members 