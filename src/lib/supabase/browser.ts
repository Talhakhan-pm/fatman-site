import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabasePublishableKey);
}
