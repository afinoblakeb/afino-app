# Authentication and Onboarding Implementation Plan

## Overview

This document outlines the implementation plan for the authentication and onboarding flow in the Afino platform. The goal is to create a seamless experience for users signing up, creating or joining organizations, and setting up their profiles.

## Current Status

- Authentication with Supabase Auth is implemented
- User creation in the database is working
- Organization creation during onboarding is not working properly
  - When a user logs in, they are added to the auth table and users table, but no organization is created

## Problem Statement

Currently, when a user signs up and logs in, they are successfully added to the Supabase auth table and the users table in our database. However, the onboarding flow is incomplete as no organization is created for the user, which is a critical part of the platform's functionality.

## Implementation Plan

We will follow a test-driven development approach, writing tests first and then implementing the features.

### 1. Testing Strategy

#### Unit Tests

- **Onboarding Page Tests**
  - Test rendering of the profile step
  - Test submission of profile information
  - Test organization creation
  - Test organization joining

#### API Route Tests

- **Auth Callback Route Tests**
  - Test redirection to onboarding for new users
  - Test redirection to dashboard for existing users
  - Test redirection to sign-in for invalid requests

- **Organization API Tests**
  - Test organization creation
  - Test organization joining
  - Test error handling for invalid inputs

### 2. Implementation Details

#### 2.1 Auth Callback Route

The auth callback route needs to be updated to check if the user is new (has no organizations) and redirect them to the onboarding flow if they are.

**Key functionality:**
- Exchange code for session
- Create or get user profile
- Check if user has any organizations
- Redirect to onboarding or dashboard accordingly

#### 2.2 Onboarding Page

Create a new onboarding page with a multi-step form for setting up the user's profile and organization.

**Key components:**
- Profile step with first name and last name fields
- Organization step with options to create or join an organization
- Create organization form with name field
- Join organization form with organization ID field

#### 2.3 User Profile API

Create an API route for updating the user's profile.

**Key functionality:**
- Authenticate the user
- Update user profile with first name, last name, and full name
- Return updated profile data

#### 2.4 Organization API

Create an API route for creating organizations.

**Key functionality:**
- Validate organization name
- Generate a slug from the organization name
- Create the organization in the database
- Assign the admin role to the user
- Add the user to the organization

#### 2.5 Organization Join API

Create an API route for joining existing organizations.

**Key functionality:**
- Validate organization ID
- Check if organization exists
- Assign the member role to the user
- Add the user to the organization

### 3. Utility Functions

#### 3.1 Slug Generation

Create a utility function to generate slugs from organization names.

**Requirements:**
- Convert to lowercase
- Replace spaces and special characters with hyphens
- Ensure uniqueness

#### 3.2 Domain Utilities

Enhance the existing domain utilities to:
- Extract domain from email
- Suggest organization name from domain
- Validate email format

### 4. Database Schema Updates

Ensure the database schema supports the onboarding flow:
- User model with profile fields
- Organization model with name, domain, and slug
- Role model with organization relationship
- UserOrganization model for many-to-many relationship

### 5. Timeline and Milestones

1. **Day 1**: Write tests for all components
2. **Day 2**: Implement auth callback and user profile API
3. **Day 3**: Implement onboarding page and organization APIs
4. **Day 4**: Test and debug the complete flow
5. **Day 5**: Polish UI and improve error handling

### 6. Success Criteria

The implementation will be considered successful when:
- New users are properly redirected to the onboarding flow
- Users can complete their profile information
- Users can create or join organizations
- Users are properly assigned roles within organizations
- The flow is smooth and error-free

### 7. Relationship to Other Features

This implementation plan is closely related to the following feature plans:

- **Authentication Feature Plan**: This plan builds upon the basic authentication setup described in the Authentication Feature Plan, focusing specifically on the onboarding flow after authentication.

- **Organization Creation Feature Plan**: The organization creation functionality described here is a subset of the complete Organization Creation feature, focused specifically on the creation during onboarding.

- **User Profile Feature Plan**: The profile update functionality here is a minimal version of what will be expanded in the full User Profile feature.

- **Role Management Feature Plan**: The basic role assignment during onboarding will be expanded in the full Role Management feature.

### 8. Next Steps After Implementation

After completing this implementation, the following features should be prioritized:

1. Complete the User Profile management feature
2. Enhance the Organization management capabilities
3. Implement the User Invitation flow
4. Expand the Role Management interface
