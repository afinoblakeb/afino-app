# Coding Standards

This document outlines the coding standards and best practices for the Afino fintech platform. Adhering to these standards ensures code consistency, maintainability, and quality across the project.

## TypeScript

### Type Safety

- **Use strict type checking**: Enable `strict` mode in `tsconfig.json`.
- **Avoid `any` type**: Use specific types or `unknown` when the type is truly unknown.
- **Use type inference**: Let TypeScript infer types when possible, but add explicit types for function parameters and return values.
- **Create reusable interfaces and types**: Define shared types in dedicated files.

### Example

```typescript
// Bad
const processTransaction = (data: any) => {
  // ...
};

// Good
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

const processTransaction = (transaction: Transaction): Promise<boolean> => {
  // ...
  return Promise.resolve(true);
};
```

## React & Next.js

### Component Structure

- **Functional components**: Use functional components with hooks instead of class components.
- **Component organization**: One component per file, named the same as the file.
- **Props typing**: Always type component props using TypeScript interfaces.
- **Default exports**: Use default exports for components.

### Example

```typescript
// UserProfile.tsx
import { FC } from 'react';

interface UserProfileProps {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const UserProfile: FC<UserProfileProps> = ({ userId, name, email, role }) => {
  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <p>{email}</p>
      <p>Role: {role}</p>
    </div>
  );
};

export default UserProfile;
```

### State Management

- **Use React hooks**: Prefer `useState`, `useReducer`, and `useContext` for state management.
- **Consider Zustand**: For more complex state, use Zustand.
- **Avoid prop drilling**: Use context or state management libraries for deeply nested state.

## Tailwind CSS

### Usage Guidelines

- **Follow utility-first approach**: Compose designs directly in markup with utility classes.
- **Extract components**: Use React components for reusable UI patterns, not custom CSS classes.
- **Use theme configuration**: Extend the Tailwind theme for brand colors, typography, etc.
- **Responsive design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.) consistently.

### Example

```tsx
// Good
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md shadow-sm">
  Submit
</button>

// Avoid custom CSS when possible
```

## API and Data Fetching

### Next.js API Routes

- **RESTful principles**: Follow RESTful conventions for API endpoints.
- **Input validation**: Validate all inputs using a library like Zod.
- **Error handling**: Use consistent error response format.
- **HTTP status codes**: Use appropriate HTTP status codes.

### Data Fetching

- **Use SWR or React Query**: For client-side data fetching with caching and revalidation.
- **Server components**: Leverage Next.js 15 server components for data fetching when appropriate.
- **Error boundaries**: Implement error boundaries for handling data fetching errors.

## File Structure

```
src/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── (auth)/           # Auth-related routes
│   ├── dashboard/        # Dashboard routes
│   └── ...
├── components/           # Shared components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ...
├── lib/                  # Utility functions and shared code
│   ├── api/              # API client
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   └── ...
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## Code Quality

### Linting and Formatting

- **ESLint**: Follow the project's ESLint configuration.
- **Prettier**: Use Prettier for code formatting.
- **Pre-commit hooks**: Use Husky and lint-staged to enforce linting and formatting on commit.

### Testing

- **Jest**: Use Jest for unit and integration tests.
- **React Testing Library**: Use for component tests.
- **Test coverage**: Aim for at least 70% test coverage for critical paths.

### Documentation

- **JSDoc comments**: Add JSDoc comments for functions and components.
- **README files**: Include README files for complex directories.
- **Code comments**: Comment complex logic, but prefer self-documenting code.

## Security Best Practices

- **Input validation**: Validate all user inputs.
- **Authentication**: Use Supabase Auth for authentication.
- **Authorization**: Implement proper authorization checks.
- **CSRF protection**: Use CSRF tokens for forms.
- **XSS prevention**: Sanitize user-generated content.
- **Secure headers**: Set appropriate security headers.

## Performance

- **Bundle size**: Monitor and optimize bundle size.
- **Code splitting**: Use dynamic imports for code splitting.
- **Image optimization**: Use Next.js Image component.
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations.
- **Virtualization**: Use virtualization for long lists.

## Accessibility

- **Semantic HTML**: Use semantic HTML elements.
- **ARIA attributes**: Add ARIA attributes when necessary.
- **Keyboard navigation**: Ensure keyboard navigability.
- **Color contrast**: Maintain sufficient color contrast.
- **Screen reader support**: Test with screen readers.

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

Example:
```
feat(auth): add multi-factor authentication
``` 