import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://voeylkbijpapbbhmjlrg.supabase.co'
const supabaseAnonKey = 'sb_publishable_91RossvK7e0a8mTjpqi35A_JaSTsbi8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
