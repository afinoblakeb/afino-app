// This file is kept for backward compatibility
// New code should use the client and server utilities directly
import { createClient as createClientSide } from '@/utils/supabase/client'

// Export the client-side Supabase client
export const supabase = createClientSide(); 