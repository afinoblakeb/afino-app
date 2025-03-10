# Component Guidelines

This document outlines the guidelines for creating and using components in the Afino fintech platform. Following these guidelines ensures consistency, reusability, and maintainability of our UI components.

## Component Architecture

### Component Types

We organize our components into the following categories:

1. **UI Components**: Basic, reusable UI elements (buttons, inputs, cards, etc.)
2. **Form Components**: Specialized components for form handling
3. **Layout Components**: Components that define page structure
4. **Feature Components**: Components specific to a feature or domain
5. **Page Components**: Top-level components that represent entire pages

### Directory Structure

```
src/
├── components/
│   ├── ui/                # UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   ├── forms/             # Form components
│   │   ├── TextField/
│   │   ├── SelectField/
│   │   ├── DatePicker/
│   │   └── ...
│   ├── layout/            # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── ...
│   └── features/          # Feature-specific components
│       ├── auth/
│       ├── transactions/
│       ├── accounts/
│       └── ...
└── app/                   # Page components
    ├── dashboard/
    ├── accounts/
    ├── transactions/
    └── ...
```

## Component Structure

### File Organization

Each component should be organized in its own directory with the following structure:

```
ComponentName/
├── index.ts              # Re-exports the component
├── ComponentName.tsx     # Main component file
├── ComponentName.test.tsx # Tests
└── types.ts              # TypeScript types (if needed)
```

For complex components, you may also include:

```
ComponentName/
├── ...
├── useComponentName.ts   # Custom hook for component logic
├── ComponentName.utils.ts # Utility functions
└── components/           # Sub-components
    ├── SubComponent1.tsx
    └── SubComponent2.tsx
```

### Component Template

Use the following template for new components:

```tsx
import { FC } from 'react';
import { ComponentNameProps } from './types';

/**
 * ComponentName - Brief description of the component
 *
 * @example
 * <ComponentName prop1="value" prop2={value} />
 */
const ComponentName: FC<ComponentNameProps> = ({
  prop1,
  prop2,
  children,
  ...restProps
}) => {
  // Component logic here
  
  return (
    <div className="component-name" {...restProps}>
      {/* Component JSX here */}
    </div>
  );
};

export default ComponentName;
```

## Props Guidelines

### Props Interface

- Use TypeScript interfaces to define component props
- Document props with JSDoc comments
- Use descriptive prop names
- Provide default values when appropriate

Example:

```tsx
interface ButtonProps {
  /** The button's variant style */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** The size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button contents */
  children: React.ReactNode;
}
```

### Props Spreading

- Avoid spreading unknown props directly onto DOM elements
- If you need to allow additional props, type them properly and spread them intentionally

```tsx
// Good
const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  ...restProps
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      type="button"
      {...restProps}
    >
      {children}
    </button>
  );
};
```

## Styling Guidelines

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow the project's design system
- Use consistent spacing, colors, and typography
- Use responsive design with Tailwind's responsive prefixes

### Component Variants

- Use prop-based variants for different component styles
- Use conditional classes based on props
- Consider using the `clsx` or `tailwind-merge` libraries for complex class combinations

Example:

```tsx
import { clsx } from 'clsx';

const Button: FC<ButtonProps> = ({ variant = 'primary', size = 'md', className, ...props }) => {
  const buttonClasses = clsx(
    'rounded font-medium focus:outline-none focus:ring-2',
    {
      // Variant classes
      'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
      'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
      'bg-transparent text-primary-600 hover:bg-primary-50': variant === 'tertiary',
      
      // Size classes
      'px-2 py-1 text-sm': size === 'sm',
      'px-4 py-2': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    className // Allow overriding with custom className
  );
  
  return <button className={buttonClasses} {...props} />;
};
```

## State Management

### Component State

- Use React hooks for component state
- Extract complex state logic into custom hooks
- Keep state as local as possible

### Form State

- Use form libraries like React Hook Form for complex forms
- Validate form inputs with Zod
- Handle form submission and errors consistently

## Accessibility

### Requirements

- All components must be accessible
- Use semantic HTML elements
- Add ARIA attributes when necessary
- Ensure keyboard navigability
- Maintain sufficient color contrast
- Support screen readers

### Checklist

- [ ] Uses semantic HTML
- [ ] Includes appropriate ARIA attributes
- [ ] Supports keyboard navigation
- [ ] Has sufficient color contrast
- [ ] Works with screen readers
- [ ] Handles focus management

## Testing

### Test Requirements

- Write tests for all components
- Test component rendering
- Test user interactions
- Test different prop combinations
- Test edge cases

### Example Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
  });
});
```

## Documentation

### Component Documentation

- Add JSDoc comments to components and props
- Include usage examples
- Document component variants and states
- Explain any complex logic or edge cases

## Financial UI Considerations

### Currency Display

- Use appropriate formatting for currency values
- Consider internationalization
- Show appropriate precision for monetary values
- Use consistent formatting across the application

### Data Visualization

- Use appropriate charts and graphs for financial data
- Ensure data visualizations are accessible
- Provide alternative text or data tables for screen readers
- Use consistent colors and styles for data visualization

### Security Indicators

- Use clear visual indicators for secure/insecure states
- Provide feedback for sensitive operations
- Use appropriate icons for security-related features

## Performance Considerations

- Use memoization for expensive components
- Implement virtualization for long lists
- Optimize re-renders with `React.memo`, `useMemo`, and `useCallback`
- Lazy load components when appropriate 