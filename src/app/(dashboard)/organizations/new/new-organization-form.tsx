'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
      <h1 className="text-3xl font-bold mb-6">Create New Organization</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
        <p className="text-gray-600 mb-6">Create a new organization to collaborate with your team.</p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Organization Name
            </label>
            <input
              type="text"
              {...form.register("name")}
              onChange={handleNameChange}
              placeholder="Acme Inc."
              className="w-full p-2 border rounded-md"
            />
            {form.formState.errors.name && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">This is the name of your organization.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Organization URL
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">app.afino.com/</span>
              <input
                type="text"
                {...form.register("slug")}
                placeholder="acme-inc"
                className="w-full p-2 border rounded-md"
              />
            </div>
            {form.formState.errors.slug && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.slug.message}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">This will be used for your organization&apos;s URL.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Domain (Optional)
            </label>
            <input
              type="text"
              {...form.register("domain")}
              placeholder="acme.com"
              className="w-full p-2 border rounded-md"
            />
            {form.formState.errors.domain && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.domain.message}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">The domain associated with your organization. Leave blank if none.</p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
            
            <button
              type="button"
              onClick={() => window.history.back()}
              className="ml-4 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 