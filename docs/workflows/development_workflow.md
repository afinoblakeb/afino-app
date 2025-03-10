# Development Workflow

This document outlines the development workflow for the Afino fintech platform. It covers the process from setting up the development environment to deploying changes to production.

## Development Environment Setup

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm or yarn
- Git
- Supabase CLI
- Vercel CLI (optional)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/afino.git
   cd afino
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials and other required environment variables.

4. Initialize Shadcn UI:
   ```bash
   npx shadcn@latest init
   ```

5. Start the local Supabase instance:
   ```bash
   supabase start
   ```

6. Set up Prisma with the database:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Apply migrations to the database
   npx prisma migrate dev
   
   # Seed the database with initial data
   npx prisma db seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Feature Development Process

### 1. Feature Planning

1. Create a feature plan file in the `docs/feature-plans/` directory:
   ```bash
   cp docs/feature-plans/feature-plan-template.md docs/feature-plans/feature-plan-[feature_name].md
   ```

2. Fill out the feature plan with:
   - Overview
   - Requirements
   - Technical approach
   - Components needed
   - API endpoints
   - Database changes
   - Testing strategy
   - Acceptance criteria

3. Review the feature plan with the team.

### 2. Database Schema Changes

If the feature requires database changes:

1. Update the Prisma schema in `prisma/schema.prisma`.

2. Generate a migration with a descriptive name:
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

3. Review the generated SQL in the `prisma/migrations` directory.

4. Update any affected TypeScript types or interfaces.

### 3. Test-Driven Development

1. Write tests for the feature before implementing it:
   - Unit tests for components and functions
   - Integration tests for interactions
   - End-to-end tests for critical flows

2. Ensure tests are failing initially (red phase).

### 4. Implementation

1. Create a new feature branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/[feature_name]
   ```

2. Implement the feature using Shadcn UI components where applicable:
   ```bash
   npx shadcn@latest add [component]
   ```

3. Build the project after each new .tsx file is created or modified:
   ```bash
   npm run build
   ```

4. Fix any build errors immediately before proceeding.

5. Update the PROGRESS.md file after each successful build.

6. Make regular commits following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### 5. Testing

1. Run tests to ensure they pass (green phase):
   ```bash
   npm run test
   ```

2. Refactor code while maintaining passing tests (refactor phase).

3. Run end-to-end tests:
   ```bash
   npm run test:e2e
   ```

### 6. Documentation

1. Update relevant project context files with any changes.

2. Document any new components or APIs.

3. Update the PROGRESS.md file to mark completed tasks.

### 7. Code Review

1. Push the feature branch to the remote repository:
   ```bash
   git push -u origin feature/[feature_name]
   ```

2. Create a pull request to merge the feature branch into `develop`.

3. Ensure the CI/CD pipeline passes.

4. Address any feedback from reviewers.

5. After code review and approval, merge the pull request.

## Git Workflow

We follow a Git Flow-inspired workflow:

### Branches

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Hot fix branches for production issues
- `release/*`: Release branches

### Feature Development

1. Create a new feature branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/my-feature
   ```

2. Implement the feature, making regular commits following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

3. Push the feature branch to the remote repository:
   ```bash
   git push -u origin feature/my-feature
   ```

4. Create a pull request to merge the feature branch into `develop`.

5. After code review and approval, merge the pull request.

### Bug Fixes

1. Create a new bugfix branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b bugfix/my-bugfix
   ```

2. Fix the bug, making regular commits following the Conventional Commits specification.

3. Push the bugfix branch to the remote repository:
   ```bash
   git push -u origin bugfix/my-bugfix
   ```

4. Create a pull request to merge the bugfix branch into `develop`.

5. After code review and approval, merge the pull request.

### Hot Fixes

1. Create a new hotfix branch from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/my-hotfix
   ```

2. Fix the issue, making regular commits following the Conventional Commits specification.

3. Push the hotfix branch to the remote repository:
   ```bash
   git push -u origin hotfix/my-hotfix
   ```

4. Create a pull request to merge the hotfix branch into `main`.

5. After code review and approval, merge the pull request.

6. Merge the hotfix into `develop` as well:
   ```bash
   git checkout develop
   git pull
   git merge --no-ff hotfix/my-hotfix
   git push
   ```

### Releases

1. Create a new release branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b release/v1.0.0
   ```

2. Make any final adjustments, version bumps, and documentation updates.

3. Push the release branch to the remote repository:
   ```bash
   git push -u origin release/v1.0.0
   ```

4. Create a pull request to merge the release branch into `main`.

5. After code review and approval, merge the pull request.

6. Tag the release:
   ```bash
   git checkout main
   git pull
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push --tags
   ```

7. Merge the release into `develop` as well:
   ```bash
   git checkout develop
   git pull
   git merge --no-ff release/v1.0.0
   git push
   ```

## Development Process

### Task Management

We use GitHub Issues and Projects for task management:

1. **Backlog Refinement**: Product team creates and prioritizes issues in the backlog.
2. **Sprint Planning**: Team selects issues for the sprint and assigns them to developers.
3. **Implementation**: Developers implement the features or fix the bugs.
4. **Code Review**: Team members review the code changes.
5. **Testing**: QA team tests the changes.
6. **Deployment**: Changes are deployed to the appropriate environment.

### Issue Workflow

1. **To Do**: Issues that are ready to be worked on.
2. **In Progress**: Issues that are currently being worked on.
3. **Review**: Issues that are ready for code review.
4. **Testing**: Issues that are ready for testing.
5. **Done**: Issues that are completed and deployed.

### Pull Request Process

1. Create a pull request with a descriptive title and description.
2. Link the pull request to the relevant issue(s).
3. Assign reviewers to the pull request.
4. Address any feedback from reviewers.
5. Once approved, merge the pull request.

## Code Review Guidelines

### What to Look For

- **Functionality**: Does the code work as expected?
- **Code Quality**: Is the code well-written, maintainable, and follows best practices?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security vulnerabilities?
- **Testing**: Are there appropriate tests?
- **Documentation**: Is the code well-documented?
- **Build Verification**: Does the code build successfully?
- **Progress Tracking**: Has the PROGRESS.md file been updated?
- **Database Changes**: Are database migrations properly implemented?

### Review Process

1. **Automated Checks**: CI/CD pipeline runs linting, type checking, and tests.
2. **Manual Review**: Reviewers examine the code changes.
3. **Feedback**: Reviewers provide feedback on the pull request.
4. **Revisions**: Developer addresses the feedback.
5. **Approval**: Reviewers approve the pull request once satisfied.

## Testing Strategy

For detailed information on testing, see [Testing Strategy](./testing_strategy.md).

### Types of Tests

- **Unit Tests**: Test individual functions and components.
- **Integration Tests**: Test interactions between components.
- **End-to-End Tests**: Test complete user flows.
- **Performance Tests**: Test application performance.
- **Security Tests**: Test for security vulnerabilities.

### Testing Process

1. **Local Testing**: Developers run tests locally before pushing changes.
2. **CI Testing**: CI/CD pipeline runs tests automatically.
3. **QA Testing**: QA team performs manual testing.
4. **User Acceptance Testing**: Stakeholders verify the changes meet requirements.

## Database Management

### Prisma ORM

We use Prisma ORM for database management:

1. **Schema Definition**: Define the database schema in `prisma/schema.prisma`.
2. **Migrations**: Generate and apply migrations using Prisma Migrate.
3. **Type-Safe Queries**: Use Prisma Client for type-safe database access.
4. **Seeding**: Seed the database with initial data using `prisma/seed.ts`.

### Migration Workflow

1. **Make Schema Changes**: Update the `prisma/schema.prisma` file with your changes.

2. **Generate Migration Files**: Create a new migration with a descriptive name:
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

3. **Review Migration Files**: Carefully review the generated SQL in the `prisma/migrations` directory.

4. **Apply Migrations in Development**: Migrations are automatically applied when generated.

5. **Apply Migrations in Production**: Use the following command in production:
   ```bash
   npx prisma migrate deploy
   ```

### Migration Best Practices

1. **Descriptive Names**: Use clear, descriptive names for migrations (e.g., `add_user_preferences_field`).
2. **Small, Focused Migrations**: Create small, focused migrations that do one thing well.
3. **Version Control**: Commit migration files to version control.
4. **Never Edit Existing Migrations**: Once a migration is applied, never edit it. Create a new migration instead.
5. **Test Migrations**: Test migrations in development and staging environments before applying to production.
6. **Backup Before Migrating**: Always backup the database before applying migrations in production.
7. **Rollback Plan**: Have a rollback plan for each migration.

## Continuous Integration and Deployment

### CI/CD Pipeline

We use GitHub Actions for CI/CD:

1. **Build**: Build the application.
2. **Test**: Run tests.
3. **Lint**: Run linting and type checking.
4. **Migrate**: Apply database migrations.
5. **Deploy**: Deploy to the appropriate environment.

### Environments

- **Development**: Automatically deployed from the `develop` branch.
- **Staging**: Automatically deployed from release branches.
- **Production**: Manually deployed from the `main` branch after approval.

### Deployment Process

1. **Development Deployment**:
   - Automatically triggered when changes are merged into the `develop` branch.
   - Deployed to the development environment.

2. **Staging Deployment**:
   - Automatically triggered when a release branch is created.
   - Deployed to the staging environment.
   - QA team performs testing.

3. **Production Deployment**:
   - Manually triggered after approval.
   - Deployed to the production environment.
   - Monitored for any issues.

## Database Migrations

### Creating Migrations

1. Update the Prisma schema in `prisma/schema.prisma`.

2. Generate a migration with a descriptive name:
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

3. Review the generated SQL in the `prisma/migrations` directory.

### Deploying Migrations

Migrations are automatically applied during the deployment process:

1. Development and staging environments: Migrations are applied automatically.
2. Production environment: Migrations are applied after approval.

## Monitoring and Debugging

### Monitoring Tools

- **Vercel Analytics**: Monitor application performance and usage.
- **Sentry**: Track errors and exceptions.
- **Supabase Dashboard**: Monitor database performance and usage.
- **Prisma Studio**: Inspect and modify database data during development.

### Debugging Process

1. **Identify the Issue**: Use monitoring tools to identify the issue.
2. **Reproduce the Issue**: Try to reproduce the issue locally.
3. **Fix the Issue**: Implement a fix for the issue.
4. **Test the Fix**: Verify the fix resolves the issue.
5. **Deploy the Fix**: Deploy the fix to the appropriate environment.

## Documentation

### Code Documentation

- **JSDoc Comments**: Add JSDoc comments to functions and components.
- **README Files**: Include README files for complex directories.
- **Code Comments**: Comment complex logic, but prefer self-documenting code.

### Project Documentation

- **Architecture Documentation**: Document the system architecture.
- **API Documentation**: Document the API endpoints.
- **User Documentation**: Document the user-facing features.
- **Progress Tracking**: Maintain the PROGRESS.md file.
- **Feature Plans**: Create and maintain feature plan files.
- **Database Schema**: Keep the database schema documentation up to date.

## Communication

### Team Communication

- **Daily Standups**: Brief daily meetings to discuss progress and blockers.
- **Sprint Planning**: Plan the work for the upcoming sprint.
- **Sprint Review**: Review the work completed in the sprint.
- **Sprint Retrospective**: Reflect on the sprint and identify improvements.

### Stakeholder Communication

- **Demo Sessions**: Demonstrate new features to stakeholders.
- **Release Notes**: Document changes in each release.
- **Status Reports**: Provide regular status updates to stakeholders.

## Security Practices

### Secure Development

- **Code Analysis**: Use static code analysis tools to identify security vulnerabilities.
- **Dependency Scanning**: Regularly scan dependencies for vulnerabilities.
- **Security Reviews**: Conduct security reviews for critical features.

### Secure Deployment

- **Environment Variables**: Store sensitive information in environment variables.
- **Access Control**: Restrict access to production environments.
- **Audit Logging**: Log all access to production environments.

## Performance Optimization

### Performance Monitoring

- **Lighthouse**: Monitor web performance metrics.
- **Core Web Vitals**: Track Core Web Vitals metrics.
- **Custom Metrics**: Track application-specific performance metrics.

### Performance Improvement

- **Code Splitting**: Split code into smaller chunks.
- **Image Optimization**: Optimize images for web.
- **Caching**: Implement appropriate caching strategies.
- **Database Optimization**: Optimize database queries and indexes.

## Accessibility

### Accessibility Testing

- **Automated Testing**: Use tools like axe-core for automated accessibility testing.
- **Manual Testing**: Perform manual accessibility testing.
- **Screen Reader Testing**: Test with screen readers.

### Accessibility Improvements

- **Semantic HTML**: Use semantic HTML elements.
- **ARIA Attributes**: Add ARIA attributes when necessary.
- **Keyboard Navigation**: Ensure keyboard navigability.
- **Color Contrast**: Maintain sufficient color contrast.

## Internationalization and Localization

### i18n Setup

- **Translation Files**: Store translations in JSON files.
- **Translation Management**: Use a translation management system.
- **Dynamic Loading**: Load translations dynamically based on user preferences.

### Localization Process

- **Extract Strings**: Extract strings for translation.
- **Translate Strings**: Translate strings to target languages.
- **Review Translations**: Review translations for accuracy.
- **Deploy Translations**: Deploy translations to the application.

## Conclusion

This development workflow is designed to ensure high-quality, secure, and efficient development of the Afino fintech platform. By following these guidelines, we can maintain a consistent and productive development process. 