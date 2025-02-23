import { createClient } from "@/utils/supabase/server";

export async function refreshGmailToken(
  accountId: string
): Promise<string | undefined> {
  const supabase = await createClient();

  // Get the account with refresh token
  const { data: account } = await supabase
    .from("email_accounts")
    .select("refresh_token")
    .eq("id", accountId)
    .single();

  if (!account?.refresh_token) {
    throw new Error("No refresh token found");
  }

  // Use Supabase to refresh the token
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: account.refresh_token,
  });

  if (error || !data.session) {
    throw new Error("Failed to refresh token");
  }

  // Update the account with new tokens
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await supabase
    .from("email_accounts")
    .update({
      oauth_token: data.session.provider_token,
      token_expires_at: expiresAt.toISOString(),
    })
    .eq("id", accountId);

  return data.session.provider_token ?? undefined;
}
