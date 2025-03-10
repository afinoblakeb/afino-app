'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Upload } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export function ProfileHeader({ name, email, avatarUrl }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Get initials for avatar fallback
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Handle avatar upload
  const handleAvatarUpload = () => {
    // This will be implemented when we add file upload functionality
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setIsOpen(false);
    }, 1500);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <div className="relative cursor-pointer group">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl || undefined} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Upload Profile Picture</SheetTitle>
                <SheetDescription>
                  Choose an image to use as your profile picture
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Profile picture upload will be implemented soon
                </p>
                <Button 
                  onClick={handleAvatarUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : 'Upload Picture'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 