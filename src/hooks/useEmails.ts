import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import createClient from "@/lib/supabase/client";
import { createEmailService } from "@/services/email/factory";
import useEmailAccounts from "./useEmailAccounts";

type EmailProvider = "gmail" | "outlook" | "other";

// Hook for fetching emails from a specific account
export function useEmails(userId: string, accountId: string) {
  const supabase = createClient();

  const fetchEmailsPage = async ({ pageParam = "" }) => {
    if (!userId || !accountId) throw new Error("Missing user ID or account ID");

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
      accountId,
    });

    const emails = await emailService.listEmails({
      pageToken: pageParam,
    });

    // Convert the emails to the Email type
    const emailsWithDate = emails.emails.map((email) => ({
      ...email,
      accountId,
      provider: account.provider,
      date: email.date,
      id: email.id,
      subject: email.subject,
      from: email.from,
      preview: email.snippet || "",
      read: !email.isUnread,
    }));

    return {
      emails: emailsWithDate,
      nextPageToken: emails.nextPageToken,
    };
  };

  return useInfiniteQuery({
    queryKey: ["emails", accountId, userId] as const,
    queryFn: fetchEmailsPage,
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: !!accountId && !!userId,
  });
}

// New hook for fetching emails from all accounts
export function useAllEmails(userId: string) {
  const supabase = createClient();
  const { data: accounts = [] } = useEmailAccounts(userId);

  const fetchEmailsForAccount = async (accountId: string) => {
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
      accountId,
    });

    const emails = await emailService.listEmails({
      pageToken: "", // Start with first page
    });

    // Convert the emails to the Email type
    return emails.emails.map((email) => ({
      ...email,
      accountId,
      provider: account.provider,
      date: email.date,
      id: email.id,
      subject: email.subject,
      from: email.from,
      preview: email.snippet || "",
      read: !email.isUnread,
    }));
  };

  const fetchAllEmails = async () => {
    if (!userId) throw new Error("No user authenticated");
    if (accounts.length === 0) return [];

    try {
      // Fetch up to 25 emails from each account
      const emailsPromises = accounts.map((account) =>
        fetchEmailsForAccount(account.id)
      );

      const results = await Promise.all(emailsPromises);

      // Combine all emails and sort by date
      const allEmails = results
        .flat()
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      return allEmails;
    } catch (error) {
      console.error("Error fetching all emails:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["allEmails", userId] as const,
    queryFn: fetchAllEmails,
    enabled: !!userId && accounts.length > 0,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });
}

export function useEmailContent(emailId?: string, accountId?: string) {
  return useQuery({
    queryKey: ["emailContent", emailId, accountId] as const,
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
        accountId,
      });

      return emailService.getEmail({
        emailId,
      });
    },
    enabled: !!emailId && !!accountId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
