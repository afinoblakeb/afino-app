import { QueryClient } from '@tanstack/react-query';

/**
 * Invalidates the organizations cache, forcing a refetch on the next query.
 * This should be called after creating, updating, or deleting an organization.
 * 
 * @param queryClient - The React Query client instance
 * @param userId - Optional user ID to invalidate specific user's organizations
 */
export function invalidateOrganizationsCache(queryClient: QueryClient, userId?: string) {
  if (userId) {
    // Invalidate specific user's organizations
    queryClient.invalidateQueries({ queryKey: ['organizations', userId] });
  } else {
    // Invalidate all organizations queries
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
  }
} 