"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.provider_token) {
        try {
          const response = await fetch("/api/gmail/list", {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
            },
          });
          const data = await response.json();
          setEmails(data.emails);
        } catch (error) {
          console.error("Failed to fetch emails:", error);
        }
      }
      setLoading(false);
    };

    fetchEmails();
  }, []);

  if (loading) return <div>Loading emails...</div>;

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div key={email.id} className="border p-4 rounded-lg">
          <div className="font-bold">{email.subject}</div>
          <div className="text-sm text-gray-600">From: {email.from}</div>
          <div className="mt-2">{email.snippet}</div>
          <div className="text-sm text-gray-500 mt-2">
            {new Date(email.date).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
