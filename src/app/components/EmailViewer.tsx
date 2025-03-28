"use client";

import React, { useEffect, useRef } from "react";
import { Email, EmailContent } from "@/types/email";

interface EmailViewerProps {
  emailDetails: Email | undefined;
  emailContent: EmailContent | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  emailId?: string;
}

const EmailViewer = ({
  emailDetails,
  emailContent,
  isLoading,
  isError,
  error,
  emailId,
}: EmailViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleIframeLoad = () => {
      if (!iframeRef.current) return;
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) return;

      const links = iframeDoc.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          try {
            const url = new URL(link.href, iframeDoc.baseURI);
            window.open(url.toString(), "_blank");
          } catch (e) {
            console.error("Invalid link URL:", link.href, e);
          }
        });
      });
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = handleIframeLoad;
    }

    return () => {
      if (iframe) {
        iframe.onload = null;
      }
    };
  }, [emailContent]);

  if (!emailId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select an email to view
      </div>
    );
  }

  if (isLoading) {
    const message = emailDetails
      ? "Loading email content..."
      : "Loading email details...";
    return (
      <div className="h-full flex items-center justify-center">{message}</div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Error loading email: {error?.message || "Unknown error"}
      </div>
    );
  }

  if (!emailDetails) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Email details not available. Select another email.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 md:p-6 border-b">
        <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
          {emailDetails.subject}
        </h1>
        <div className="space-y-1 text-xs md:text-sm text-gray-600">
          <div>
            From: {emailContent?.headers?.from || emailDetails.from || "N/A"}
          </div>
          {emailContent?.headers?.to && (
            <div>To: {emailContent.headers.to}</div>
          )}
          {emailContent?.headers?.cc && (
            <div>CC: {emailContent.headers.cc}</div>
          )}
          <div className="text-gray-500">
            {new Date(
              emailContent?.headers?.date || emailDetails.date
            ).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 md:p-4">
        {emailContent?.html ? (
          <div className="h-full">
            <iframe
              title={`Email content for ${emailDetails.subject}`}
              srcDoc={emailContent.html}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-popups"
              ref={iframeRef}
            />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words font-mono text-sm p-2 md:p-4">
            {emailContent?.text ||
              emailDetails.snippet ||
              "No text content available."}
          </div>
        )}
      </div>

      {emailContent?.attachments && emailContent.attachments.length > 0 && (
        <div className="flex-none border-t p-4 md:p-6">
          <h2 className="font-semibold mb-2 text-base">Attachments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emailContent.attachments.map((attachment) => (
              <div
                key={attachment.id || attachment.filename}
                className="flex items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex-1 truncate min-w-0">
                  <div className="font-medium truncate text-sm">
                    {attachment.filename}
                  </div>
                  <div className="text-xs text-gray-500">
                    {attachment.size > 0
                      ? `${Math.round(attachment.size / 1024)} KB`
                      : ""}
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
