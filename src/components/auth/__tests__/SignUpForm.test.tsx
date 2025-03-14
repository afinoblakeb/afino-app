/**
 * Tests for the SignUpForm component
 * Verifies form rendering, validation, submission, and error handling
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '../SignUpForm';
import { createClient } from '@/utils/supabase/client';

// Mock the supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
    },
  })),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests that the SignUpForm renders all expected elements
   */
  it('renders the sign-up form correctly', () => {
    render(<SignUpForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Use more specific selectors to avoid ambiguity
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  /**
   * Tests form validation for required fields
   */
  it('validates form inputs', async () => {
    render(<SignUpForm />);
    
    // Submit form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors - update to match actual error messages in the component
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  /**
   * Tests password confirmation validation
   */
  it('validates password confirmation', async () => {
    render(<SignUpForm />);
    
    // Fill in email and mismatched passwords - use more specific selectors
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Check for password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  /**
   * Tests successful form submission with valid data
   */
  it('submits the form with valid data', async () => {
    // Mock successful sign-up
    const mockSupabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: '123' } },
          error: null,
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    render(<SignUpForm />);
    
    // Fill in form with valid data - use more specific selectors
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Check if supabase.auth.signUp was called with correct arguments
    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
    });
  });

  /**
   * Tests error handling when sign-up fails
   */
  it('handles sign-up error', async () => {
    // Mock sign-up error
    const mockSupabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Email already registered' },
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    render(<SignUpForm />);
    
    // Fill in form with valid data - use more specific selectors
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });
}); 