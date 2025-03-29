import { createClient } from "@/lib/supabase/server";

export const getAccountById = async (accountId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_accounts")
    .select("*")
    .eq("id", accountId);

  if (error) {
    throw error;
  }

  return data[0];
};
