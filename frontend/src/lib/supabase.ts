import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://czislsbuucmuqxlwoccs.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_zE1wfHqz48SuwT9h6FQ9AA_gVQzfflC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
