import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import createClient from "@/lib/supabase/client";
import { createEmailService } from "@/services/email/factory";

type EmailProvider = "gmail" | "outlook" | "other";

export function useEmails(userId: string, accountId?: string) {
  const supabase = createClient();

  const fetchEmailsPage = async ({ pageParam = "" }) => {
    if (!accountId) throw new Error("No account selected");
    if (!userId) throw new Error("No user authenticated");

    const { data: account } = await supabase
      .from("email_accounts")
      .select("oauth_token, provider")
      .eq("id", accountId)
      .single();

    if (!account?.oauth_token) {
      throw new Error("No access token found");
    }

    const emailService = createEmailService({
      type: account.provider as EmailProvider,
      accessToken: account.oauth_token as string,
    });

    return emailService.listEmails({
      accountId,
      accessToken: account.oauth_token as string,
      pageToken: pageParam,
    });
  };

  return useInfiniteQuery({
    queryKey: ["emails", accountId, userId] as const,
    queryFn: fetchEmailsPage,
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: !!accountId && !!userId,
  });
}

export function useEmailContent(emailId?: string, accountId?: string) {
  return useQuery({
    queryKey: ["emailContent", emailId] as const,
    queryFn: async () => {
      if (!emailId || !accountId) {
        throw new Error("Missing email or account ID");
      }

      const supabase = createClient();
      const { data: account } = await supabase
        .from("email_accounts")
        .select("oauth_token, provider")
        .eq("id", accountId)
        .single();

      if (!account?.oauth_token) {
        throw new Error("No access token found");
      }

      const emailService = createEmailService({
        type: account.provider as EmailProvider,
        accessToken: account.oauth_token as string,
      });

      return emailService.getEmail({
        emailId,
        accountId,
        accessToken: account.oauth_token as string,
      });
    },
    enabled: !!emailId && !!accountId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
