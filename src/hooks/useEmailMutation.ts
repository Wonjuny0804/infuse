import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmailService } from "@/services/email/factory";
import createClient from "@/lib/supabase/client";
import { InfiniteEmailsResponse } from "@/types/email";

export function useEmailMutation() {
  const queryClient = useQueryClient();

  const mutationFn = async ({
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
      accountId,
      accessToken: account.oauth_token,
    });

    await emailService.updateReadStatus({
      emailId,
      isUnread,
    });
  };

  const onSuccess = (
    _: unknown,
    { emailId, accountId }: { emailId: string; accountId: string }
  ) => {
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
  };

  return useMutation({
    mutationFn,
    onSuccess,
  });
}
