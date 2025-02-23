"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";

interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

interface EmailAccount {
  id: string;
  provider: string;
  email_address: string;
  oauth_token: string;
}

interface EmailContent {
  html?: string;
  text?: string;
  headers?: {
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    date: string;
  };
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
  }>;
  threadId?: string;
  labelIds?: string[];
}

export default function EmailViewer({
  email,
  account,
}: {
  email?: Email;
  account?: EmailAccount;
}) {
  const [content, setContent] = useState<EmailContent>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !account) return;

    const fetchEmailContent = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data: emailAccount } = await supabase
          .from("email_accounts")
          .select("oauth_token")
          .eq("id", account.id)
          .single();

        if (emailAccount?.oauth_token) {
          const response = await fetch(`/api/gmail/messages/${email.id}`, {
            headers: {
              Authorization: `Bearer ${emailAccount.oauth_token}`,
            },
          });
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to fetch email content:", error);
      }
      setLoading(false);
    };

    fetchEmailContent();
  }, [email, account]);

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select an email to view
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading email...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-6 border-b">
        <h1 className="text-2xl font-semibold mb-4">{email.subject}</h1>
        <div className="space-y-2 text-sm text-gray-600">
          <div>From: {content?.headers?.from || email.from}</div>
          {content?.headers?.to && <div>To: {content.headers.to}</div>}
          {content?.headers?.cc && <div>CC: {content.headers.cc}</div>}
          <div className="text-gray-500">
            {new Date(content?.headers?.date || email.date).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {content?.html ? (
          <div className="[&>*]:!all-unset h-full">
            <iframe
              srcDoc={content.html}
              className="w-full h-full border-none"
              sandbox="allow-same-origin"
              style={{ minHeight: "calc(100vh - 300px)" }}
            />
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-mono text-sm">
            {content?.text || email.snippet}
          </div>
        )}
      </div>

      {content?.attachments?.length && content.attachments.length > 0 && (
        <div className="flex-none border-t p-6">
          <h2 className="font-semibold mb-2">Attachments</h2>
          <div className="grid grid-cols-2 gap-4">
            {content.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center p-3 border rounded-lg"
              >
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">
                    {attachment.filename}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round(attachment.size / 1024)}KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
