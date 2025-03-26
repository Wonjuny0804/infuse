import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmailService } from "@/services/email/factory";
import createClient from "@/lib/supabase/client";
import { InfiniteEmailsResponse } from "@/types/email";

export function useEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      accountId,
      isUnread,
    }: {
      emailId: string;
      accountId: string;
      isUnread: boolean;
    }) => {
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
        type: account.provider,
        accessToken: account.oauth_token,
      });

      await emailService.updateReadStatus({
        emailId,
        accountId,
        isUnread,
        accessToken: account.oauth_token,
      });
    },
    onSuccess: (_, { emailId, accountId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emails", accountId],
      });

      queryClient.setQueryData<InfiniteEmailsResponse>(
        ["emails", accountId],
        (old) => {
          if (!old) return old;
          console.log("=== old ===", old);
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              emails: page.emails.map((email) =>
                email.id === emailId
                  ? { ...email, isUnread: !email.isUnread }
                  : email
              ),
            })),
          };
        }
      );
    },
  });
}
