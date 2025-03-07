# Afino Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://afino-app.vercel.app)

A modern fintech platform built with Next.js, Supabase, and Prisma.

## Project Structure

This repository is organized as a monorepo:

- `/` - Root directory containing the Next.js application
- `/project-docs` - Project documentation and context files
  - `/project-docs/cursorrules` - Guidelines and architecture documentation
  - `/project-docs/docs` - Feature plans and implementation details
  - `/project-docs/PROGRESS.md` - Project progress tracking

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/afinoblakeb/afino-app.git
   cd afino-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your database and Supabase credentials.

4. Set up Prisma with the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Key Development Requirements

- **UI Component Library**: Use Shadcn UI components for consistent design
- **Database Management**: Use Prisma ORM for schema management and migrations
- **Continuous Build Verification**: Ensure the project is deployable after each build
- **Progress Tracking**: Maintain the PROGRESS.md file with a checklist format
- **Feature Planning**: Create feature plan files with specific sections
- **Test-Driven Development**: Write tests before implementing features
- **Documentation Maintenance**: Keep project context files up to date

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL), Prisma ORM
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Directory Structure

```
afino-app/
├── .github/            # GitHub Actions workflows
├── prisma/             # Prisma schema and migrations
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Database migrations
│   └── seed.ts         # Database seed script
├── project-docs/       # Project documentation
│   ├── cursorrules/    # Guidelines and architecture docs
│   ├── docs/           # Feature plans and implementation details
│   └── PROGRESS.md     # Project progress tracking
├── public/             # Static assets
├── src/                # Application source code
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utility functions and libraries
│   └── hooks/          # Custom React hooks
└── ... configuration files
```

## Development Workflow

See [project-docs/cursorrules/workflows/development_workflow.md](project-docs/cursorrules/workflows/development_workflow.md) for detailed development workflow guidelines.

## Testing Strategy

See [project-docs/cursorrules/guidelines/testing_strategy.md](project-docs/cursorrules/guidelines/testing_strategy.md) for detailed testing guidelines.

## License

[MIT](LICENSE) 