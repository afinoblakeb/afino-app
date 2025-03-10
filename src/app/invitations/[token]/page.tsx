'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface InvitationPageProps {
  params: {
    token: string;
  };
}

interface InvitationDetails {
  id: string;
  email: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: {
    id: string;
    name: string;
  };
  invitedBy?: {
    id: string;
    name: string | null;
  } | null;
  expiresAt: string;
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const { token } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  
  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/invitations/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invitation');
        }
        
        if (!data.valid) {
          setError(data.error || 'Invalid invitation');
          setInvitation(null);
        } else {
          setInvitation(data.invitation);
          setError(null);
        }
      } catch (error) {
        console.error('Error loading invitation:', error);
        setError(error instanceof Error ? error.message : 'Failed to load invitation');
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvitation();
  }, [token]);
  
  // Accept invitation
  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }
      
      toast({
        title: 'Invitation accepted',
        description: `You have joined ${invitation?.organization.name}`,
      });
      
      // Redirect to the organization
      router.push(`/organizations/${data.organization.slug}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
      setAccepting(false);
    }
  };
  
  // Decline invitation
  const handleDeclineInvitation = async () => {
    try {
      setDeclining(true);
      
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }
      
      toast({
        title: 'Invitation declined',
        description: 'You have declined the invitation',
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline invitation',
        variant: 'destructive',
      });
      setDeclining(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation is no longer valid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle>You&apos;ve Been Invited</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join {invitation?.organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Organization</p>
            <p className="text-sm">{invitation?.organization.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Role</p>
            <p className="text-sm">{invitation?.role.name}</p>
          </div>
          {invitation?.invitedBy && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Invited by</p>
              <p className="text-sm">{invitation.invitedBy.name || 'Organization Admin'}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleDeclineInvitation}
            disabled={declining || accepting}
          >
            {declining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </>
            )}
          </Button>
          <Button 
            onClick={handleAcceptInvitation}
            disabled={declining || accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept & Join
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 