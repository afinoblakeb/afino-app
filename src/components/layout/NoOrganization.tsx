'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NoOrganization() {
  const router = useRouter();
  const [domainOrSlug, setDomainOrSlug] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  const handleCreateOrg = () => {
    router.push('/organizations/new');
  };

  const handleJoinOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainOrSlug.trim()) {
      router.push(`/organizations/join?domain=${domainOrSlug.trim()}`);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Afino</CardTitle>
          <CardDescription>
            Get started by creating or joining an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="join">Join Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-4 space-y-4">
              <div className="text-center">
                <p className="mb-4">Create your own organization and invite team members</p>
                <Button onClick={handleCreateOrg} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="join" className="mt-4 space-y-4">
              <form onSubmit={handleJoinOrg}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Organization Domain or Slug</Label>
                    <Input
                      id="domain"
                      placeholder="acme-inc or acme.com"
                      value={domainOrSlug}
                      onChange={(e) => setDomainOrSlug(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Find Organization
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="link" onClick={() => router.push('/profile')}>
            Go to your profile settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 