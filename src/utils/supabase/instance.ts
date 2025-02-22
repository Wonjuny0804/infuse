import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";

let supabaseInstance: SupabaseClient | null = null;

export async function getSupabaseInstance() {
  if (!supabaseInstance) {
    supabaseInstance = await createClient();
  }
  return supabaseInstance;
}
