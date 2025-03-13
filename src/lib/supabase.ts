/**
 * @deprecated This file is kept for backward compatibility
 * New code should use the client and server utilities directly from @/utils/supabase/
 * This file will be removed in a future version
 */
import { createClient } from '@/utils/supabase/client';

// Export the client-side Supabase client
export const supabase = createClient();
