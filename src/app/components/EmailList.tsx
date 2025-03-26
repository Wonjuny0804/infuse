"use client";

import { useEmails } from "@/hooks/useEmails";
import { Email, EmailAccount } from "@/types/email";
import { formatTime } from "@/lib/utils";

interface EmailListProps {
  account?: EmailAccount;
  selectedEmailId?: string;
  onSelectEmail: (email: Email) => void;
}

const EmailList = ({
  account,
  selectedEmailId,
  onSelectEmail,
}: EmailListProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useEmails(account?.id);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  if (isLoading) return <div className="p-4">Loading emails...</div>;

  if (isError)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div
      className="border-r border-gray-200 h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      {data?.pages.map((page) =>
        page.emails.map((email) => (
          <div
            key={email.id}
            className={`py-2 px-4 border-b cursor-pointer relative ${
              selectedEmailId === email.id ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelectEmail(email)}
          >
            {email.isUnread && (
              <div className="absolute top-3 left-2 w-2 h-2 rounded-full bg-blue-500" />
            )}
            <div className="pl-4">
              <div className="flex justify-between items-center">
                <div className="font-medium truncate flex-1 text-sm">
                  {email.subject}
                </div>
                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {formatTime(email.date)}
                </div>
              </div>
              <div className="text-xs text-gray-600 truncate mt-0.5">
                {email.from}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {email.snippet}
              </div>
            </div>
          </div>
        ))
      )}
      {isFetchingNextPage && (
        <div className="py-2 text-center text-gray-500 text-sm">
          Loading more emails...
        </div>
      )}
    </div>
  );
};

export default EmailList;
