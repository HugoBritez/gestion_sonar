/* eslint-disable prettier/prettier */
import { createClient } from '@supabase/supabase-js'
import { Database } from '../shared/types/database'


const supabaseUrl = 'https://qjtqtfdnfqhwjlddbnph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdHF0ZmRuZnFod2psZGRibnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjkxMjcsImV4cCI6MjA2MTk0NTEyN30.9Rc0nSqpxTOChn-hWYl6b_kv9xTc_a-1hNoeDWhB2r0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth : {
        persistSession:  true,
        autoRefreshToken: true
    }
});