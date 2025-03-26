"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import GmailConnectPopup from "../components/GmailConnectPopup";
import EmailAccountsList from "../components/EmailAccountsList";
import EmailList from "../components/EmailList";
import EmailViewer from "../components/EmailViewer";
import Navigation from "../components/Navigation";
import { Email, EmailAccount } from "@/types/email";
import { useEmailMutation } from "@/hooks/useEmailMutation";

interface DashboardClientProps {
  initialEmailId?: string;
  provider?: string;
}

export default function DashboardClient({
  initialEmailId,
}: DashboardClientProps) {
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount>();
  const [selectedEmailId, setSelectedEmailId] = useState<string | undefined>(
    initialEmailId
  );
  const queryClient = useQueryClient();
  const { mutate: mutateEmailStatus } = useEmailMutation();
  const searchParams = useSearchParams();

  // Update selectedEmailId when URL changes
  useEffect(() => {
    const emailId = searchParams.get("emailId");
    if (emailId) {
      setSelectedEmailId(emailId);
    }
  }, [searchParams]);

  const handleSelectEmail = useCallback(
    (email: Email) => {
      if (!selectedAccount) return;

      // Update URL without navigation
      const newUrl = `/dashboard/${selectedAccount.provider}?emailId=${email.id}`;
      window.history.pushState({}, "", newUrl);

      setSelectedEmailId(email.id);
      queryClient.setQueryData(["email", email.id], email);

      mutateEmailStatus({
        emailId: email.id,
        accountId: selectedAccount.id,
        isUnread: false,
      });
    },
    [queryClient, selectedAccount, mutateEmailStatus]
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <Navigation />
      </div>
      <GmailConnectPopup />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/6 border-r">
          <EmailAccountsList onSelect={setSelectedAccount} />
        </div>
        <div className="w-1/4 border-r">
          <EmailList
            account={selectedAccount}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto border-b">
            <EmailViewer emailId={selectedEmailId} account={selectedAccount} />
          </div>
        </div>
      </div>
    </div>
  );
}
