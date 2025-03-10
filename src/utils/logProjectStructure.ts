/**
 * Utility function to log the project structure to the console
 * This is useful for documentation and debugging purposes
 */
export function logProjectStructure(): void {
  console.log(`
Afino App Directory Structure:
├── PROGRESS.md
├── README.md
├── components.json
├── docs/
│   ├── PROGRESS.md
│   ├── README.md
│   ├── architecture/
│   │   ├── api_design.md
│   │   ├── database_schema.md
│   │   └── overview.md
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
│   ├── guidelines/
│   │   ├── ai_collaboration.md
│   │   ├── coding_standards.md
│   │   ├── component_guidelines.md
│   │   └── development_requirements.md
│   ├── guides/
│   │   └── (future guides will be added here)
│   ├── technical/
│   │   ├── auth-flow-documentation.md
│   │   ├── ci-cd-setup.md
│   │   ├── implementation-plan.md
│   │   ├── project-structure.md
│   │   └── supabase-production-setup.md
│   └── workflows/
│       ├── deployment_process.md
│       ├── development_workflow.md
│       └── testing_strategy.md
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
`);
}

/**
 * Utility function to log a simplified project structure to the console
 * This is useful for quick reference
 */
export function logSimplifiedProjectStructure(): void {
  console.log(`
Afino App Simplified Structure:
├── docs/ - Project documentation
│   ├── architecture/ - Architecture documentation
│   ├── feature-plans/ - Feature planning documents
│   ├── guidelines/ - Development guidelines
│   ├── technical/ - Technical documentation
│   ├── workflows/ - Development workflows
│   └── guides/ - User and developer guides
├── src/
│   ├── app/ - Next.js App Router pages and API routes
│   ├── components/ - React components
│   ├── services/ - Business logic services
│   ├── utils/ - Utility functions
│   ├── lib/ - Library integrations
│   ├── providers/ - React context providers
│   ├── hooks/ - Custom React hooks
│   └── types/ - TypeScript type definitions
├── prisma/ - Database schema and migrations
├── public/ - Static assets
└── scripts/ - Utility scripts
`);
}

// Example usage:
// import { logProjectStructure, logSimplifiedProjectStructure } from '@/utils/logProjectStructure';
// 
// // Log the full project structure
// logProjectStructure();
// 
// // Or log a simplified version
// logSimplifiedProjectStructure(); 