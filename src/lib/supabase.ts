import { createClient } from '@supabase/supabase-js';

// Configuration from user
const SUPABASE_URL = 'https://psxikojawezhckmxemzm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Xx3p9OL4fco98fbW9Cgq2A_gVEoqAFr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
