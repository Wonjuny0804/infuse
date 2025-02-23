"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";

interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
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
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    if (!account) return;

    const fetchEmails = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data: emailAccount } = await supabase
          .from("email_accounts")
          .select("oauth_token")
          .eq("id", account.id)
          .single();

        if (emailAccount?.oauth_token) {
          const response = await fetch(`/api/gmail/list`, {
            headers: {
              Authorization: `Bearer ${emailAccount.oauth_token}`,
            },
          });
          const data = await response.json();
          setEmails(data.emails);
          if (data.emails.length > 0) {
            setSelectedId(data.emails[0].id);
            onSelectEmail(data.emails[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch emails:", error);
      }
      setLoading(false);
    };

    fetchEmails();
  }, [account, onSelectEmail]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="p-4">Loading emails...</div>;

  return (
    <div className="border-r border-gray-200 h-full overflow-y-auto">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`p-4 border-b cursor-pointer ${
            selectedId === email.id ? "bg-blue-50" : "hover:bg-gray-50"
          }`}
          onClick={() => {
            setSelectedId(email.id);
            onSelectEmail(email);
          }}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium truncate flex-1">{email.subject}</div>
            <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {formatTime(email.date)}
            </div>
          </div>
          <div className="text-sm text-gray-600 truncate">{email.from}</div>
          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
            {email.snippet}
          </div>
        </div>
      ))}
    </div>
  );
}
