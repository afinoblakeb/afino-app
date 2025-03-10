'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
  invitedBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface InvitationsListProps {
  organizationSlug: string;
  invitations: Invitation[];
  onUpdate: () => void;
}

export function InvitationsList({
  organizationSlug,
  invitations,
  onUpdate,
}: InvitationsListProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  // Format the status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Resend an invitation
  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      setLoading({ ...loading, [invitation.id]: true });
      
      const response = await fetch(
        `/api/organizations/${organizationSlug}/invitations/${invitation.id}`,
        {
          method: 'PUT',
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend invitation');
      }
      
      toast.success('Invitation resent', {
        description: `Invitation to ${invitation.email} has been resent.`,
      });
      
      // Refresh the invitations list
      onUpdate();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to resend invitation',
      });
    } finally {
      setLoading({ ...loading, [invitation.id]: false });
    }
  };

  // Open the delete confirmation dialog
  const openDeleteDialog = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setDeleteDialogOpen(true);
  };

  // Delete an invitation
  const handleDeleteInvitation = async () => {
    if (!selectedInvitation) return;
    
    try {
      setLoading({ ...loading, [selectedInvitation.id]: true });
      
      const response = await fetch(
        `/api/organizations/${organizationSlug}/invitations/${selectedInvitation.id}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete invitation');
      }
      
      toast.success('Invitation deleted', {
        description: `Invitation to ${selectedInvitation.email} has been deleted.`,
      });
      
      // Refresh the invitations list
      onUpdate();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete invitation',
      });
    } finally {
      setLoading({ ...loading, [selectedInvitation.id]: false });
      setDeleteDialogOpen(false);
      setSelectedInvitation(null);
    }
  };

  return (
    <div>
      {invitations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No invitations have been sent yet
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.email}</TableCell>
                <TableCell>{invitation.role.name}</TableCell>
                <TableCell>{formatStatus(invitation.status)}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {invitation.status === 'pending'
                    ? formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {invitation.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResendInvitation(invitation)}
                        disabled={loading[invitation.id]}
                        title="Resend invitation"
                      >
                        {loading[invitation.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(invitation)}
                        disabled={loading[invitation.id]}
                        title="Delete invitation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the invitation to{' '}
              <strong>{selectedInvitation?.email}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvitation}>
              {loading[selectedInvitation?.id || ''] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 