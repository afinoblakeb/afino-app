import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forgot password form correctly', () => {
    render(<ForgotPasswordForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<ForgotPasswordForm />);
    
    // Submit form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ForgotPasswordForm />);
    
    // Fill in form with invalid email
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock successful password reset
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in form with valid data
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check if supabase.auth.resetPasswordForEmail was called with correct arguments
    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
    });
  });

  it('handles reset password error', async () => {
    // Mock reset password error
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Email not found' },
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in form with valid data
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/email not found/i)).toBeInTheDocument();
    });
  });
}); 