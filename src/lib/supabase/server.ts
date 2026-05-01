import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

export function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
