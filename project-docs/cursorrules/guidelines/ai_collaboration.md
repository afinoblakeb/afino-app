# AI Collaboration Guide

This guide provides best practices for collaborating with AI assistants like Claude 3.7 Sonnet in Cursor IDE when developing the Afino fintech platform.

## Core Principles

### Follow User Instructions Strictly

- **Never create unsolicited features**: Only implement features that are explicitly requested by the user
- **Do not make assumptions about features**: Ask for clarification if requirements are unclear
- **Focus on the specific task at hand**: Don't expand scope beyond what was requested
- **Seek approval before suggesting alternatives**: Always check with the user before proposing different approaches

## Effective Prompting Strategies

### Be Specific and Contextual

- **Provide clear objectives**: State what you want to achieve, not just what you want the AI to do.
- **Include relevant context**: Mention which part of the application you're working on and how it relates to other components.
- **Specify technical constraints**: Mention performance requirements, browser compatibility, or other technical considerations.

Example:
```
Bad: "Create a login form."
Good: "Create a login form component for our admin dashboard that validates email and password, handles form submission to our Supabase auth endpoint, and follows our design system guidelines for form elements."
```

### Reference Project Context

Always reference relevant project context files when asking for assistance:

- "Following our component guidelines in `cursorrules/guidelines/component_guidelines.md`..."
- "According to our database schema in `cursorrules/architecture/database_schema.md`..."
- "Using the API design pattern from `cursorrules/architecture/api_design.md`..."
- "Following our development requirements in `cursorrules/guidelines/development_requirements.md`..."
- "According to our progress file in `PROGRESS.md`..."
- "Based on our Prisma schema in `prisma/schema.prisma`..."

### Iterative Development

- Break complex tasks into smaller, manageable chunks
- Review and provide feedback on each iteration
- Build upon previous work rather than starting from scratch each time

## Development Requirements

When working with AI assistants, always emphasize these key development requirements:

### 1. Shadcn UI Components

- Always ask for Shadcn UI components when applicable
- Specify which Shadcn components to use in your prompts
- Example: "Please create a dashboard card component using Shadcn's Card component"

### 2. Prisma ORM for Database Operations

- Always use Prisma ORM for database operations
- Ask for Prisma schema updates when modifying the database
- Request proper migrations for schema changes
- Example: "Please update the Prisma schema to add a new field to the User model and create a migration"

### 3. Continuous Build Verification

- Remind the AI to build the project after creating or modifying .tsx files
- Ask for build error fixes before proceeding with new development
- Example: "After creating this component, please make sure it builds successfully with `npm run build`"

### 4. Progress Tracking

- Reference the PROGRESS.md file when starting work on a feature
- Ask the AI to update the progress file after successful builds
- Example: "After implementing this feature, please update the PROGRESS.md file to mark it as completed"

### 5. Feature Planning

- Request a feature plan before implementing any feature
- Reference the feature plan template in docs/feature-plans/
- Example: "Before implementing the authentication feature, please create a feature plan following our template"

### 6. Test-Driven Development

- Always ask for tests before implementation
- Specify the types of tests needed (unit, integration, e2e)
- Example: "Please write unit tests for the transaction list component before implementing it"

### 7. Documentation Maintenance

- Ask the AI to update relevant documentation when making changes
- Specify which documentation files need to be updated
- Example: "After implementing this API endpoint, please update the API design documentation"

## Code Generation Best Practices

### Providing Context for Code Generation

When asking the AI to generate code:

1. **Specify file location**: Indicate where the code will be placed in the project structure.
2. **Describe dependencies**: Mention which libraries, components, or utilities the code should use.
3. **Outline expected behavior**: Describe how the code should behave, including edge cases.
4. **Reference existing patterns**: Point to similar code in the project that follows the desired pattern.
5. **Specify Shadcn components**: Mention which Shadcn components should be used.
6. **Request tests first**: Ask for tests before implementation code.
7. **Mention database requirements**: Specify any Prisma models or queries needed.

### Database Schema Changes

When requesting database schema changes:

1. **Reference existing schema**: Point to the current Prisma schema.
2. **Specify model changes**: Clearly describe the changes needed to models.
3. **Request migration creation**: Ask for a migration to be created with a descriptive name.
4. **Ask for migration review**: Request a review of the generated SQL in the migration.
5. **Consider data preservation**: Discuss how existing data should be handled.

Example:
```
Please update the Prisma schema to add a 'status' field to the Transaction model with possible values 'pending', 'completed', or 'failed'. Then create a migration named 'add_transaction_status' and review the generated SQL to ensure it's correct.
```

### Reviewing AI-Generated Code

Always review AI-generated code for:

- **Adherence to project standards**: Does it follow our coding standards and patterns?
- **Security considerations**: Are there any potential security issues?
- **Performance implications**: Could the code cause performance problems?
- **Edge cases**: Does it handle all possible scenarios?
- **Integration points**: Does it correctly interface with other parts of the system?
- **Build verification**: Does it build successfully?
- **Test coverage**: Are there appropriate tests?
- **Shadcn usage**: Does it use Shadcn components where applicable?
- **Prisma usage**: Does it use Prisma correctly for database operations?

## Troubleshooting Common Issues

### When AI Generates Incorrect Code

1. Identify the specific issue with the generated code
2. Provide clear feedback about what's wrong
3. Share relevant documentation or examples
4. Ask for a specific correction

### When AI Misunderstands Requirements

1. Rephrase your request with more specific details
2. Break down complex requirements into smaller parts
3. Provide examples of expected input and output
4. Reference similar functionality elsewhere in the codebase

### When AI Lacks Context

1. Share relevant sections of the codebase
2. Explain the broader system architecture
3. Provide links to documentation or specifications
4. Describe the user journey or business logic

## Project-Specific Guidelines for Afino

### Financial Data Handling

When working with financial data:

- Always use appropriate data types for currency (e.g., Decimal, not Float)
- Implement proper validation for financial inputs
- Follow security best practices for sensitive financial information
- Consider internationalization for currency formatting

### Database Operations

When working with the database:

- Always use Prisma Client for database operations
- Use transactions for operations that modify multiple records
- Implement proper error handling for database operations
- Consider performance implications of queries
- Follow the migration best practices

### Regulatory Compliance

- Mention relevant regulatory requirements (GDPR, PCI DSS, etc.) when implementing features
- Ask the AI to include necessary compliance-related code comments
- Request documentation for compliance-sensitive features

### Security-First Approach

- Always ask for secure implementations of authentication and authorization
- Request input validation and sanitization for all user inputs
- Emphasize secure API design and data handling

## Implementation Workflow with AI

When implementing a feature with AI assistance, follow this workflow:

1. **Feature Planning**: Ask the AI to create or reference a feature plan
2. **Database Schema**: Request any necessary Prisma schema updates and migrations
3. **Test Creation**: Request tests for the feature before implementation
4. **Implementation**: Ask for implementation code using Shadcn components
5. **Build Verification**: Request build verification after implementation
6. **Progress Update**: Ask the AI to update the PROGRESS.md file
7. **Documentation Update**: Request updates to relevant documentation

Example prompt:
```
I'd like to implement the user authentication feature. Please:
1. Create a feature plan in docs/feature-plans/feature-plan-authentication.md
2. Update the Prisma schema if needed and create migrations
3. Write unit and integration tests for the authentication components
4. Implement the components using Shadcn's Form components
5. Verify it builds successfully with npm run build
6. Update the PROGRESS.md file to mark the authentication tasks as completed
7. Update any relevant documentation
```

## Continuous Improvement

Document successful collaboration patterns and add them to this guide. Share feedback on what works well and what could be improved in our AI collaboration workflow. 