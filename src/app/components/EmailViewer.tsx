"use client";

import { useEmailContent } from "@/hooks/useEmails";
import { EmailAccount, Email } from "@/types/email";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface EmailViewerProps {
  emailId?: string;
  account?: EmailAccount;
}

const EmailViewer = ({ emailId, account }: EmailViewerProps) => {
  const queryClient = useQueryClient();
  const { data: email } = useQuery<Email>({
    queryKey: ["email", emailId] as const,
    queryFn: () => {
      const cachedEmail = queryClient.getQueryData<Email>(["email", emailId]);
      if (!cachedEmail) {
        throw new Error("Email not found in cache");
      }
      return cachedEmail;
    },
    enabled: !!emailId,
    staleTime: Infinity,
  });
  const { data: content, isLoading } = useEmailContent(emailId, account?.id);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const handleIframeLoad = () => {
      if (!iframeRef.current) return;
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) return;

      // Select all links inside the iframe and modify their behavior
      const links = iframeDoc.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          window.open(link.href, "_blank");
        });
      });
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
      }
    };
  }, []);

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select an email to view
      </div>
    );
  }

  if (isLoading) {
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
              sandbox="allow-same-origin allow-scripts allow-popups"
              style={{ minHeight: "calc(100vh - 300px)" }}
              ref={iframeRef}
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
};

export default EmailViewer;
