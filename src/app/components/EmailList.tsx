"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";

interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  onReadStateChange?: (emailId: string, isUnread: boolean) => void;
}

interface EmailAccount {
  id: string;
  provider: string;
  email_address: string;
  oauth_token: string;
}

export default function EmailList({
  account,
  onSelectEmail,
}: {
  account?: EmailAccount;
  onSelectEmail: (email: Email) => void;
}) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [pageToken, setPageToken] = useState<string>();

  const fetchEmails = useCallback(
    async (nextPageToken?: string) => {
      if (!account) return;

      try {
        const supabase = createSupabaseClient();
        const { data: emailAccount } = await supabase
          .from("email_accounts")
          .select("oauth_token")
          .eq("id", account.id)
          .single();

        if (emailAccount?.oauth_token) {
          const response = await fetch(
            `/api/gmail/list${
              nextPageToken ? `?pageToken=${nextPageToken}` : ""
            }`,
            {
              headers: {
                Authorization: `Bearer ${emailAccount.oauth_token}`,
              },
            }
          );
          const data = await response.json();

          if (nextPageToken) {
            setEmails((prev) => [...prev, ...data.emails]);
          } else {
            setEmails(data.emails);
            if (data.emails.length > 0) {
              setSelectedId(data.emails[0].id);
              onSelectEmail(data.emails[0]);
            }
          }

          setPageToken(data.nextPageToken);
          setHasMore(!!data.nextPageToken);
        }
      } catch (error) {
        console.error("Failed to fetch emails:", error);
      }
    },
    [account, onSelectEmail]
  );

  useEffect(() => {
    setLoading(true);
    fetchEmails().finally(() => setLoading(false));
  }, [account, fetchEmails]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasMore &&
      !loadingMore
    ) {
      setLoadingMore(true);
      await fetchEmails(pageToken);
      setLoadingMore(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add method to update read state
  const updateEmailReadState = (emailId: string, isUnread: boolean) => {
    setEmails((currentEmails) =>
      currentEmails.map((email) =>
        email.id === emailId ? { ...email, isUnread } : email
      )
    );
  };

  // Pass both email and update function when selecting
  const handleSelectEmail = (email: Email) => {
    setSelectedId(email.id);
    onSelectEmail({ ...email, onReadStateChange: updateEmailReadState });
  };

  if (loading) return <div className="p-4">Loading emails...</div>;

  return (
    <div
      className="border-r border-gray-200 h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      {emails.map((email) => (
        <div
          key={email.id}
          className={`py-2 px-4 border-b cursor-pointer relative ${
            selectedId === email.id ? "bg-blue-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleSelectEmail(email)}
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
      ))}
      {loadingMore && (
        <div className="py-2 text-center text-gray-500 text-sm">
          Loading more emails...
        </div>
      )}
    </div>
  );
}
