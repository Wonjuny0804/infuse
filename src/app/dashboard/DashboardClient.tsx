"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import EmailList from "../components/EmailList";
import EmailViewer from "../components/EmailViewer";
import { Email, EmailAccount, EmailContent } from "@/types/email";
import { useEmailMutation } from "@/hooks/useEmailMutation";
import { useEmails, useEmailContent } from "@/hooks/useEmails";
import useUser from "@/hooks/useUser";

interface DashboardClientProps {
  initialEmailId?: string;
  provider?: string;
}

export default function DashboardClient({
  initialEmailId,
  provider,
}: DashboardClientProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | undefined>(
    initialEmailId
  );
  const queryClient = useQueryClient();
  const { mutate: mutateEmailStatus } = useEmailMutation();
  const searchParams = useSearchParams();

  const userData = useUser();
  const userId = userData?.id;

  // --- Find accountId based on provider ---
  const accountId = useMemo(() => {
    if (!provider) return undefined;
    const accounts =
      queryClient.getQueryData<EmailAccount[]>(["emailAccounts"]) || [];
    const accountForProvider = accounts.find(
      (acc) => acc.provider === provider
    );
    return accountForProvider?.id;
  }, [provider, queryClient]);

  // --- Fetch Email List ---
  const {
    data: emailListData,
    isLoading: isLoadingEmails,
    isError: isErrorEmails,
    error: errorEmails,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmails(userId || "", accountId);

  // --- Fetch Selected Email Basic Details (from cache first) ---
  const { data: selectedEmailDetails, isLoading: isLoadingEmailDetails } =
    useQuery<Email | undefined>({
      queryKey: ["email", selectedEmailId],
      queryFn: async () => {
        const cachedEmail = queryClient.getQueryData<Email>([
          "email",
          selectedEmailId,
        ]);
        if (cachedEmail) return cachedEmail;
        console.warn(
          `Email ${selectedEmailId} not found in cache for details view.`
        );
        return undefined;
      },
      enabled: !!selectedEmailId,
      staleTime: 5 * 60 * 1000,
    });

  // --- Fetch Selected Email Content ---
  const {
    data: emailContent,
    isLoading: isLoadingContent,
    isError: isErrorContent,
    error: contentError,
  } = useEmailContent(selectedEmailId, accountId);

  // --- URL Sync Effect ---
  useEffect(() => {
    const emailIdFromUrl = searchParams.get("emailId");
    if (emailIdFromUrl && emailIdFromUrl !== selectedEmailId) {
      setSelectedEmailId(emailIdFromUrl);
    } else if (!emailIdFromUrl && selectedEmailId) {
      // Optional: Clear selection if emailId is removed from URL
      // setSelectedEmailId(undefined);
    }
  }, [searchParams, selectedEmailId]);

  // --- Email Selection Handler ---
  const handleSelectEmail = useCallback(
    (email: Email) => {
      if (!accountId || !provider) {
        console.warn(`Cannot select email, missing accountId or provider`);
        return;
      }

      const newUrl = `/dashboard/emails?provider=${provider}&emailId=${email.id}`;
      window.history.pushState({}, "", newUrl);

      setSelectedEmailId(email.id);

      queryClient.setQueryData(["email", email.id], email);

      if (email.isUnread) {
        mutateEmailStatus({
          emailId: email.id,
          accountId: accountId,
          isUnread: false,
        });
      }
    },
    [accountId, provider, queryClient, mutateEmailStatus]
  );

  if (!userId) {
    return <div className="p-4 text-center">Loading user...</div>;
  }

  if (!accountId && provider) {
    return (
      <div className="p-4 text-center">
        Finding account details for {provider}...
      </div>
    );
  }
  if (!provider) {
    return <div className="p-4 text-center">Select an account tab.</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r overflow-y-auto">
          <EmailList
            data={emailListData}
            isLoading={isLoadingEmails}
            isError={isErrorEmails}
            error={errorEmails}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            accountId={accountId}
            userId={userId}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto border-b">
            <EmailViewer
              emailDetails={selectedEmailDetails}
              emailContent={emailContent as EmailContent}
              isLoading={isLoadingEmailDetails || isLoadingContent}
              isError={isErrorContent}
              error={contentError}
              emailId={selectedEmailId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
