/**
 * Tests for the SignInForm component
 * Verifies form rendering, validation, submission, and error handling
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from '../SignInForm';
import { createClient } from '@/utils/supabase/client';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock the supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  })),
  customStorageAdapter: {
    setItem: jest.fn(),
  },
}));

// Mock the useAuth hook
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
  }),
}));

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests that the SignInForm renders all expected elements in the initial view
   */
  it('renders the sign in form', () => {
    render(<SignInForm />);
    
    // Check for form elements in the initial view
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  /**
   * Tests that clicking "Sign in with Email" shows the email form
   */
  it('shows email form when "Sign in with Email" is clicked', async () => {
    render(<SignInForm />);
    
    // Click the "Sign in with Email" button
    fireEvent.click(screen.getByRole('button', { name: /sign in with email/i }));
    
    // Check that the email form is now visible
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  /**
   * Tests form validation for required fields
   */
  it('validates form inputs', async () => {
    render(<SignInForm />);
    
    // Click the "Sign in with Email" button to show the form
    fireEvent.click(screen.getByRole('button', { name: /sign in with email/i }));
    
    // Wait for the form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    // Submit form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors - match the actual error messages in the component
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  /**
   * Tests successful form submission with valid data
   */
  it('submits the form with valid data', async () => {
    // Mock successful sign in
    const mockSupabase = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    render(<SignInForm />);
    
    // Click the "Sign in with Email" button to show the form
    fireEvent.click(screen.getByRole('button', { name: /sign in with email/i }));
    
    // Wait for the form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(submitButton);
    
    // Check if supabase.auth.signInWithPassword was called with correct arguments
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  /**
   * Tests error handling when sign in fails
   */
  it('handles sign in errors', async () => {
    // Mock sign in error
    const mockSupabase = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid login credentials' },
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    render(<SignInForm />);
    
    // Click the "Sign in with Email" button to show the form
    fireEvent.click(screen.getByRole('button', { name: /sign in with email/i }));
    
    // Wait for the form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  /**
   * Tests Google sign-in functionality
   */
  it('initiates Google sign-in when Google button is clicked', async () => {
    // Mock Google sign in
    const mockSupabase = {
      auth: {
        signInWithOAuth: jest.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com',
        search: '?next=/dashboard',
      },
      writable: true,
    });
    
    render(<SignInForm />);
    
    // Click the Google sign-in button
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleButton);
    
    // Check if supabase.auth.signInWithOAuth was called with correct arguments
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://example.com/auth/callback',
        },
      });
    });
  });
}); 