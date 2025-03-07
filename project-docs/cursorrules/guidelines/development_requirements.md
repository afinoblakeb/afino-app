# Development Requirements

This document outlines the development requirements for the Afino platform. These requirements ensure consistency, quality, and maintainability of the codebase, supporting effective collaboration, especially when pair programming with AI assistants.

## UI Component Library

All UI components should be built using the Shadcn UI component library. This ensures consistency in design and behavior across the application.

- Use Shadcn UI components whenever possible
- Follow the Shadcn UI documentation for component usage
- Customize components using the Tailwind CSS utility classes
- Create custom components only when necessary, following the Shadcn UI design patterns

## Database Management

Prisma ORM should be used for all database operations. This ensures type safety, maintainability, and a robust migration strategy.

- Define the database schema in `prisma/schema.prisma`
- Use Prisma Migrate for database migrations
- Use Prisma Client for type-safe database access
- Follow the migration best practices outlined below

### Migration Best Practices

1. **Small, Focused Migrations**: Create small, focused migrations that do one thing well.
2. **Descriptive Names**: Use clear, descriptive names for migrations (e.g., `add_organization_slug_field`).
3. **Documentation**: Document complex migrations with a README.md file in the migration directory.
4. **Testing**: Test migrations in development environments before applying to production.
5. **Rollback Plan**: Have a rollback plan for each migration.

## Continuous Build Verification

After each significant change, verify that the project can be built and deployed successfully.

1. Run `npm run build` to ensure the project builds without errors
2. Run `npm run lint` to ensure there are no linting errors
3. Run `npm run test` to ensure all tests pass
4. Fix any issues before committing changes

## Progress Tracking

Maintain the `PROGRESS.md` file to track the progress of the project. This file should be updated after each significant change.

- Use a checklist format for tasks
- Mark completed tasks with `[x]`
- Mark pending tasks with `[ ]`
- Group tasks by feature or category
- Include subtasks for complex tasks

## Feature Planning

Create a feature plan file for each major feature in the `docs/feature-plans` directory. Use the template provided in `docs/feature-plans/feature-plan-template.md`.

- Include user stories
- Define functional and non-functional requirements
- Outline the technical implementation approach
- Specify testing strategy
- Define acceptance criteria

## Test-Driven Development

Follow a test-driven development approach whenever possible.

- Write tests before implementing features
- Ensure all code is covered by tests
- Use Jest for unit and integration tests
- Use Playwright for end-to-end tests
- Run tests before committing changes

## Documentation Maintenance

Keep project context files up to date. These files provide important context for developers and AI assistants.

- Update `README.md` with new setup instructions or dependencies
- Update architecture documentation when making significant changes
- Document API endpoints and data models
- Include examples and usage instructions for complex features

## Implementation Checklist

When implementing a feature, follow this checklist:

1. Create or update the feature plan
2. Write tests for the feature
3. Update the Prisma schema and create migrations if needed
4. Implement the feature
5. Verify that all tests pass
6. Update documentation
7. Update the `PROGRESS.md` file
8. Verify that the project builds successfully
9. Commit changes with a descriptive message 