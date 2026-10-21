import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// shortcut: fallback placeholder url if env is not configured, prevents client crash before project credentials are provided
const supabaseUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
