// this hook will be used to get the email accounts from the database.

import { useQuery } from "@tanstack/react-query";
import createClient from "@/lib/supabase/client";
import { EmailAccount } from "@/types/email";

const useEmailAccounts = (userId: string) => {
  const supabase = createClient();

  const queryFn = async () => {
    const { data, error } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return data as EmailAccount[];
  };

  return useQuery({ queryKey: ["emailAccounts"], queryFn });
};

export default useEmailAccounts;
