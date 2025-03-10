'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Form validation schema
const organizationSettingsSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }).max(50, {
    message: "Organization name must not exceed 50 characters.",
  }),
});

type OrganizationSettingsFormValues = z.infer<typeof organizationSettingsSchema>;

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
}

interface OrganizationSettingsClientProps {
  organization: Organization;
}

export default function OrganizationSettingsClient({ organization }: OrganizationSettingsClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form
  const form = useForm<OrganizationSettingsFormValues>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: organization.name,
    },
  });

  // Handle form submission
  const onSubmit = async (data: OrganizationSettingsFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/organizations/${organization.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update organization');
      }
      
      setSuccessMessage('Organization settings updated successfully');
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating organization:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{organization.name} Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and preferences.
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your organization&apos;s general information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                      {successMessage}
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name of your organization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Organization URL</h4>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground">app.afino.com/</div>
                      <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                        {organization.slug}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The URL for your organization cannot be changed.
                    </p>
                  </div>
                  
                  {organization.domain && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Domain</h4>
                      <div className="flex items-center space-x-2">
                        <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                          {organization.domain}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Email domain associated with your organization.
                      </p>
                    </div>
                  )}
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your organization&apos;s branding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Logo</h4>
                  <div className="border rounded-md p-6 flex flex-col items-center justify-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Logo upload functionality will be available soon.
                    </p>
                    <Button disabled>Upload Logo</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="danger" className="space-y-4">
          <Card>
            <CardHeader className="text-destructive">
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Destructive actions for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-destructive/20 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">Delete Organization</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete an organization, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" disabled>Delete Organization</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 