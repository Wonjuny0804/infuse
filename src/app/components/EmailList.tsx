"use client";

import React from "react";
import { Email, InfiniteEmailsResponse } from "@/types/email";
import { formatTime } from "@/lib/utils";
import { Fragment } from "react";
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";

interface EmailListProps {
  data: InfiniteEmailsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<InfiniteEmailsResponse, Error>>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  selectedEmailId?: string;
  onSelectEmail: (email: Email) => void;
  accountId?: string;
  userId?: string;
}

const EmailList = ({
  data,
  isLoading,
  isError,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  selectedEmailId,
  onSelectEmail,
  accountId,
  userId,
}: EmailListProps) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !!accountId &&
      !!userId
    ) {
      fetchNextPage();
    }
  };

  if (isLoading) return <div className="p-4">Loading emails...</div>;

  if (isError)
    return (
      <div className="p-4 text-red-500">
        Error loading emails: {error?.message || "Unknown error"}
      </div>
    );

  return (
    <div
      className="border-r border-gray-200 h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      {data?.pages.length === 0 ||
      data?.pages.every((p) => p.emails.length === 0) ? (
        <div className="p-4 text-gray-500">
          No emails found for this account.
        </div>
      ) : (
        data?.pages.map((page, pageIndex) => (
          <Fragment key={pageIndex}>
            {page.emails.map((email) => (
              <div
                key={email.id}
                className={`py-2 px-4 border-b cursor-pointer relative ${
                  selectedEmailId === email.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                } ${email.isUnread ? "font-semibold" : ""}`}
                onClick={() => onSelectEmail(email)}
              >
                {email.isUnread && (
                  <div className="absolute top-3 left-2 w-2 h-2 rounded-full bg-blue-500" />
                )}
                <div className="pl-4">
                  <div className="flex justify-between items-center">
                    <div className="font-medium truncate flex-1 text-sm">
                      {email.from || "Unknown Sender"}
                    </div>
                    <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatTime(email.date)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 truncate mt-0.5">
                    {email.subject}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {email.snippet}
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
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
