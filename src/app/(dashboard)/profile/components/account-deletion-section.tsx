'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Form validation schema
const confirmDeletionSchema = z.object({
  confirmText: z.string()
    .refine((value) => value === '' || value === 'DELETE', {
      message: 'Please type DELETE to confirm',
    }),
});

type ConfirmDeletionValues = z.infer<typeof confirmDeletionSchema>;

/**
 * AccountDeletionSection component provides a UI for users to delete their account
 * It includes a confirmation dialog with a text input to prevent accidental deletion
 */
export function AccountDeletionSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  // Initialize form
  const form = useForm<ConfirmDeletionValues>({
    resolver: zodResolver(confirmDeletionSchema),
    defaultValues: {
      confirmText: '',
    },
    mode: 'onChange',
  });
  
  // Only allow submission when the text is exactly "DELETE"
  const canSubmit = form.watch('confirmText') === 'DELETE';
  
  /**
   * Handles the account deletion process
   * Makes an API call to delete the user's account and redirects to sign-in page on success
   */
  const onSubmit = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }
      
      toast.success('Account deleted', {
        description: 'Your account has been successfully deleted. Redirecting...',
      });
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('auth/signin');
      }, 2000);
    } catch (error) {
      setIsDeleting(false);
      setIsDialogOpen(false);
      
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };
  
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Danger Zone</AlertTitle>
        <AlertDescription>
          Deleting your account is permanent and cannot be undone. All your data will be deleted.
        </AlertDescription>
      </Alert>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your personal data, organizations you own,
              and any other associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="confirmText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Deletion</FormLabel>
                    <FormControl>
                      <Input placeholder="Type DELETE to confirm" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please type <span className="font-bold">DELETE</span> to confirm
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleting || !canSubmit}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <p className="text-sm text-muted-foreground">
        Note: If you are the owner of any organizations, you should transfer ownership
        before deleting your account.
      </p>
    </div>
  );
} 