import React from "react";
import Link from "next/link";
import { Email } from "@/types/email";
import { formatDistanceToNow, format } from "date-fns";
import { useEmailContent } from "@/hooks/useEmailContent";
import EmailViewer from "./EmailViewer";

interface Props {
  emails: Email[];
  providers: string[];
  selectedAccount?: string;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  selectedEmailId?: string;
}

const EmailsClient: React.FC<Props> = ({
  emails,
  selectedAccount,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  selectedEmailId,
}) => {
  // Filter emails by provider if selectedProvider is provided
  const filteredEmails = selectedAccount
    ? emails.filter((email) => email.accountId === selectedAccount)
    : emails;
  const selectedEmail = emails.find((email) => email.id === selectedEmailId);

  const formatEmailTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return (
        formatDistanceToNow(date, {
          addSuffix: false,
          includeSeconds: true,
        }).replace("about ", "") + " ago"
      );
    } catch {
      return dateString;
    }
  };

  const formatHeaderTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy hh:mm aaa");
    } catch {
      return dateString;
    }
  };

  // need to fetch the email details and content

  const {
    data: emailContent,
    isLoading,
    isError,
    error,
  } = useEmailContent(selectedEmail?.accountId || "", selectedEmailId || "");

  return (
    <div className="h-full grid grid-cols-12">
      {/* Email List */}
      <div className="col-span-3 overflow-y-auto border border-gray-100">
        {filteredEmails.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No emails found</p>
          </div>
        ) : (
          <div className="">
            {filteredEmails.map((email) => (
              <Link
                href={`/dashboard/emails?${
                  selectedAccount ? `accountId=${selectedAccount}&` : ""
                }provider=${email.provider}&emailId=${email.id}`}
                key={email.id}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <span
                      className={`font-medium text-sm ${
                        !email.read ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {email.sender || email.senderEmail}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatEmailTime(email.date)}
                    </span>
                  </div>
                  <div className="text-xs font-normal text-gray-900 mb-0.5">
                    {email.subject}
                  </div>
                  <div className="text-xs font-normal text-gray-500 truncate">
                    {email.snippet}
                  </div>
                </div>
              </Link>
            ))}

            {/* Load More Button - Always show if there are more pages */}
            {hasNextPage && (
              <div className="py-3 flex justify-center">
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-blue-300"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Email  */}
      <div className="col-span-9 overflow-y-hidden border border-gray-100">
        {/* email header */}
        <div className="px-6 py-4">
          {selectedEmail && emailContent ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {(emailContent.headers?.from || selectedEmail.sender || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {emailContent.headers?.from ||
                      selectedEmail.sender ||
                      "Unknown Sender"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedEmail.senderEmail || "No email available"}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatHeaderTime(
                  emailContent.headers?.date || selectedEmail.date
                )}
              </div>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center">
              <p className="text-gray-500">Select an email to view details</p>
            </div>
          )}
        </div>

        <EmailViewer
          emailDetails={selectedEmail}
          emailContent={emailContent}
          isLoading={isLoading}
          isError={isError}
          error={error}
          emailId={selectedEmailId}
        />
      </div>
    </div>
  );
};

export default EmailsClient;
