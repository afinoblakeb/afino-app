# Afino App Project Structure

This document provides an overview of the Afino App project structure, highlighting the key directories and files.

## Directory Tree

```
Afino App Directory Structure:
├── PROGRESS.md
├── README.md
├── components.json
├── docs/
│   ├── README.md
│   ├── feature-plans/
│   │   ├── authentication-onboarding.md
│   │   ├── feature-plan-authentication.md
│   │   ├── feature-plan-organization-creation.md
│   │   ├── feature-plan-role-management.md
│   │   ├── feature-plan-template.md
│   │   ├── feature-plan-user-invitation.md
│   │   ├── feature-plan-user-profile.md
│   │   └── user-onboarding.md
│   ├── feature-roadmap.md
│   ├── guides/
│   │   └── (future guides will be added here)
│   └── technical/
│       ├── auth-flow-documentation.md
│       ├── implementation-plan.md
│       ├── project-structure.md
│       └── supabase-production-setup.md
├── eslint.config.mjs
├── jest.config.js
├── jest.setup.js
├── next-env.d.ts
├── next.config.js
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma/
│   ├── migrations/
│   │   └── (migration files)
│   ├── schema.prisma
│   └── seed.ts
├── project-docs/
│   ├── PROGRESS.md
│   ├── ci-cd-setup.md
│   └── cursorrules/
│       ├── architecture/
│       │   ├── api_design.md
│       │   ├── database_schema.md
│       │   └── overview.md
│       ├── guidelines/
│       │   ├── ai_collaboration.md
│       │   ├── coding_standards.md
│       │   ├── component_guidelines.md
│       │   └── development_requirements.md
│       └── workflows/
│           ├── deployment_process.md
│           ├── development_workflow.md
│           └── testing_strategy.md
├── public/
│   ├── afino-logo.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   ├── check-env.js
│   ├── console-log-tree.js
│   ├── print-directory-tree.js
│   └── verify-build-parity.sh
├── src/
│   ├── __tests__/
│   │   └── basic.test.ts
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── organizations/
│   │   │   │   ├── domain/
│   │   │   │   │   └── [domain]/
│   │   │   │   │       └── route.ts
│   │   │   │   ├── join/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── users/
│   │   │       └── me/
│   │   │           └── organizations/
│   │   │               └── route.ts
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── verify/
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── __tests__/
│   │   │       ├── ForgotPasswordForm.test.tsx
│   │   │       ├── ResetPasswordForm.test.tsx
│   │   │       ├── SignInForm.test.tsx
│   │   │       └── SignUpForm.test.tsx
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── supabase-browser.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   ├── providers/
│   │   └── AuthProvider.tsx
│   ├── services/
│   │   ├── organizationService.ts
│   │   ├── roleService.ts
│   │   └── userService.ts
│   ├── types/
│   │   └── prisma.ts
│   └── utils/
│       ├── __tests__/
│       │   └── domainUtils.test.ts
│       ├── domainUtils.ts
│       ├── logProjectStructure.ts
│       └── supabase/
│           ├── client.ts
│           ├── middleware.ts
│           └── server.ts
├── tsconfig.json
└── vercel.json
```

## Key Directories and Files

### Project Root

- `PROGRESS.md`: Tracks project progress and next steps
- `README.md`: Project overview and setup instructions
- `components.json`: Configuration for Shadcn UI components
- `next.config.js`: Next.js configuration
- `prisma/schema.prisma`: Database schema definition
- `tsconfig.json`: TypeScript configuration

### Documentation (`docs/`)

- `README.md`: Overview of the documentation structure
- `feature-plans/`: Detailed plans for individual features
- `technical/`: Technical documentation and implementation details
- `guides/`: User and developer guides
- `feature-roadmap.md`: Consolidated feature roadmap

### Source Code (`src/`)

- `app/`: Next.js App Router pages and API routes
  - `(dashboard)/`: Dashboard-related pages
  - `api/`: API routes for organizations and users
  - `auth/`: Authentication-related pages
  - `onboarding/`: User onboarding flow

- `components/`: React components
  - `auth/`: Authentication-related components
  - `layout/`: Layout components
  - `ui/`: UI components (Shadcn)

- `services/`: Service layer for business logic
  - `organizationService.ts`: Organization-related operations
  - `roleService.ts`: Role management operations
  - `userService.ts`: User-related operations

- `utils/`: Utility functions
  - `domainUtils.ts`: Domain-related utilities
  - `logProjectStructure.ts`: Utility to log project structure
  - `supabase/`: Supabase client utilities

### Database (`prisma/`)

- `schema.prisma`: Prisma schema definition
- `migrations/`: Database migration files
- `seed.ts`: Database seeding script

### Public Assets (`public/`)

- `afino-logo.svg`: Afino logo
- Various SVG icons and assets

### Scripts (`scripts/`)

- `check-env.js`: Environment variable validation
- `verify-build-parity.sh`: Build verification script
- `print-directory-tree.js`: Directory tree generation script
- `console-log-tree.js`: Script to generate console.log formatted tree

## Architecture Overview

The Afino App follows a modern Next.js application architecture with:

1. **Next.js App Router**: For page routing and API routes
2. **Prisma ORM**: For database access and migrations
3. **Supabase**: For authentication and storage
4. **Shadcn UI**: For UI components
5. **Service Layer**: For business logic separation

The application is structured to support multi-tenant organizations with role-based access control, user management, and organization management features. 