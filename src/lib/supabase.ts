
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psxikojawezhckmxemzm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeGlrb2phd2V6aGNrbXhlbXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjM3NzQsImV4cCI6MjA4NDI5OTc3NH0.ZbDZhCWHwnt0uIz6jLR7xgRlauDSbffbzolByNJfLS0';

export const supabase = createClient(supabaseUrl, supabaseKey);
