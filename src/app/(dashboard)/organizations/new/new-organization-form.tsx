'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { generateSlug, isValidSlug } from '@/utils/slugUtils';

// Form validation schema
const organizationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }).max(50, {
    message: "Organization name must not exceed 50 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).max(50, {
    message: "Slug must not exceed 50 characters.",
  }).refine(isValidSlug, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  domain: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export default function NewOrganizationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      domain: "",
    },
  });

  // Handle name change to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    
    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(form.getValues("name").slice(0, -1))) {
      const slug = generateSlug(name);
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  // Handle form submission
  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Check if slug is available
      const slugCheckResponse = await fetch(`/api/organizations/check-slug/${data.slug}`);
      const slugCheckData = await slugCheckResponse.json();
      
      if (!slugCheckData.available) {
        setError('This slug is already taken. Please choose another one.');
        setIsSubmitting(false);
        return;
      }

      // Create organization
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          domain: data.domain && data.domain.trim() !== '' ? data.domain.trim() : null,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create organization');
      }

      setSuccess('Organization created successfully! Redirecting to dashboard...');
      
      // Use a simple timeout to show the success message briefly before redirecting
      setTimeout(() => {
        // Force a full page refresh to the dashboard to ensure all data is reloaded
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create New Organization</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Create a new organization to collaborate with your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md mb-6">
              {success}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={handleNameChange}
                        placeholder="Acme Inc." 
                      />
                    </FormControl>
                    <FormDescription>
                      This is the name of your organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-muted-foreground">app.afino.com/</div>
                        <Input 
                          {...field}
                          placeholder="acme-inc" 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This will be used for your organization&apos;s URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="acme.com" 
                      />
                    </FormControl>
                    <FormDescription>
                      The domain associated with your organization. Leave blank if none.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 