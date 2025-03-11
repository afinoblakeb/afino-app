'use client';

import { Loader2 } from 'lucide-react';

export function LoadingProfile() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading your profile data...</p>
    </div>
  );
} 