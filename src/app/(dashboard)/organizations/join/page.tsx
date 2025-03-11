'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain');
  
  const [domain, setDomain] = useState(domainParam || '');
  const [isLoading, setIsLoading] = useState(false);
  const [organizationDetails, setOrganizationDetails] = useState<{
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
  } | null>(null);
  
  useEffect(() => {
    if (domainParam) {
      findOrganization(domainParam);
    }
  }, [domainParam]);
  
  const findOrganization = async (domainOrSlug: string) => {
    if (!domainOrSlug.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/domain/${encodeURIComponent(domainOrSlug.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrganizationDetails(data.organization);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Organization not found');
        setOrganizationDetails(null);
      }
    } catch (error) {
      console.error('Error finding organization:', error);
      toast.error('Failed to find organization');
      setOrganizationDetails(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      await findOrganization(domain);
    }
  };
  
  const handleRequestAccess = async () => {
    if (!organizationDetails) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organizationDetails.slug}/request-access`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Access request sent successfully');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to request access');
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      toast.error('Failed to request access');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 w-full max-w-lg mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Join an Organization</CardTitle>
          <CardDescription>
            Enter the domain or slug of the organization you want to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Organization Domain or Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="acme-inc or acme.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !domain.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Find"
                  )}
                </Button>
              </div>
            </div>
          </form>
          
          {organizationDetails && (
            <div className="mt-6 p-4 border rounded-md">
              <h3 className="text-lg font-semibold">{organizationDetails.name}</h3>
              <p className="text-sm text-muted-foreground">
                {organizationDetails.domain || organizationDetails.slug}
              </p>
              <Button 
                onClick={handleRequestAccess}
                className="mt-4 w-full"
                disabled={isLoading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Request to Join
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/organizations/new')}>
            Create a New Organization
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 