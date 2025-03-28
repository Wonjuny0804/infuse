"use client";

import React, { useState } from "react";
// import EmailsClient from "@/app/components/EmailsClient";
import useUser from "@/hooks/useUser";
import useEmailAccounts from "@/hooks/useEmailAccounts";
import EmailsClient from "@/app/components/EmailsClient";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import EmailIntegrationModal from "@/app/components/EmailIntegrationModal";
import { EmailAccount } from "@/app/dashboard/emails/layout";
import { useEmails } from "@/hooks/useEmails";
import Image from "next/image";

// public/icons/[provider].svg
const providerIcons = {
  gmail: "/icons/gmail.svg",
  outlook: "/icons/outlook.svg",
  yahoo: "/icons/yahoo.svg",
  // hotmail: "/icons/hotmail.svg",
  // aol: "/icons/aol.svg",
};

const EmailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedAccountId = searchParams.get("accountId");
  const userData = useUser();
  const [showModal, setShowModal] = useState(false);
  console.log(selectedAccountId);

  const {
    data: accounts = [],
    isLoading,
    error,
  } = useEmailAccounts(userData?.id || "");
  console.log(accounts);

  // after email accounts are loaded, we can fetch the emails for the selected providers.
  const { data: emails, isLoading: isEmailsLoading } = useEmails(
    userData?.id || "",
    selectedAccountId || ""
  );
  console.log(emails);

  if (!userData || isLoading || isEmailsLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleAddAccount = () => {
    setShowModal(true);
  };

  const handleAccountAdded = (newAccount: EmailAccount) => {
    // You would typically invalidate or update your query cache here
    // For example with react-query: queryClient.invalidateQueries(['emailAccounts'])

    // Navigate to the new account's provider page with query parameter
    router.push(`/dashboard/emails?provider=${newAccount.provider}`);
    setShowModal(false);
  };

  const handleAccountSelected = (accountId: string) => {
    router.push(`/dashboard/emails?accountId=${accountId}`);
  };

  const isAccountSelected = (accountId: string) => {
    if (accountId === "all" && !selectedAccountId) return true;
    return accountId === selectedAccountId;
  };

  return (
    <>
      <div className="bg-gray-200 rounded-t-lg">
        <div className="flex items-center">
          <button
            className={`
              relative px-4 pt-2 pb-1 text-sm font-medium rounded-t-lg transition-colors
              ${
                isAccountSelected("all")
                  ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }
            `}
            onClick={() => router.push("/dashboard/emails")}
          >
            All
          </button>
          {accounts.map((account) => (
            <button
              key={account.id}
              className={`
                relative px-4 pt-2 pb-1 text-sm font-medium rounded-t-lg transition-colors
                ${
                  isAccountSelected(account.id)
                    ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }
              `}
              style={{
                marginBottom: isAccountSelected(account.id) ? "-1px" : "0",
                zIndex: isAccountSelected(account.id) ? "1" : "0",
              }}
              onClick={() => handleAccountSelected(account.id)}
            >
              <div className="flex items-center gap-2">
                <div />
                <Image
                  src={
                    providerIcons[
                      account.provider as keyof typeof providerIcons
                    ]
                  }
                  alt={account.provider}
                  width={20}
                  height={20}
                />
                <span>{account.email_address}</span>
              </div>
            </button>
          ))}
          <button
            onClick={handleAddAccount}
            className="px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg ml-2"
            aria-label="Add email account"
          >
            <PlusCircledIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5-2.97a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-5.36-1.35a2.25 2.25 0 00-1.092 0l-5.36 1.35a1.125 1.125 0 00-.852 1.09V9c0 .415.336.75.75.75h1.5a.75.75 0 00.75-.75V5.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v2.25a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75v-.621l.48.121a2.25 2.25 0 011.77 2.198v.75a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V9.75a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v2.25a2.25 2.25 0 01-2.25 2.25h-.75"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Your inbox is empty
          </h3>
          <p className="text-gray-500 max-w-md mb-4">
            Connect your email accounts to start seeing your messages here.
          </p>
          <button
            onClick={handleAddAccount}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add your first account
          </button>
        </div>
      ) : (
        <div className="p-4">
          <EmailsClient
            emails={emails?.pages.flatMap((page) => page.emails) || []}
            providers={accounts.map((acc) => acc.provider)}
            selectedAccount={selectedAccountId || undefined}
          />
        </div>
      )}

      {/* Email integration modal */}
      {showModal && (
        <EmailIntegrationModal
          onClose={() => setShowModal(false)}
          onAccountAdded={handleAccountAdded}
        />
      )}
    </>
  );
};

export default EmailsPage;
