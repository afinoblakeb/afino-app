import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordForm from '../ResetPasswordForm';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the reset password form correctly', () => {
    render(<ResetPasswordForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<ResetPasswordForm />);
    
    // Submit form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    render(<ResetPasswordForm />);
    
    // Fill in form with weak password
    await userEvent.type(screen.getByLabelText(/new password/i), 'weak');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'weak');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<ResetPasswordForm />);
    
    // Fill in form with mismatched passwords
    await userEvent.type(screen.getByLabelText(/new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock successful password update
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });
    
    render(<ResetPasswordForm />);
    
    // Fill in form with valid data
    await userEvent.type(screen.getByLabelText(/new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check if supabase.auth.updateUser was called with correct arguments
    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'password123',
      });
    });
  });

  it('handles update password error', async () => {
    // Mock update password error
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid reset token' },
    });
    
    render(<ResetPasswordForm />);
    
    // Fill in form with valid data
    await userEvent.type(screen.getByLabelText(/new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid reset token/i)).toBeInTheDocument();
    });
  });
}); 