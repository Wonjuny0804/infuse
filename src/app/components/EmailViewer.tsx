"use client";

import React, { useEffect, useRef, useState } from "react";
import { Email, EmailContent } from "@/types/email";
import dynamic from "next/dynamic";
import Quill, { Delta } from "quill";
import useReplyToMail from "@/hooks/useReplyToMail";

// Dynamically import QuillEditor with SSR disabled
const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border rounded bg-gray-50">Loading editor...</div>
  ),
});

interface Props {
  emailDetails: Email | undefined;
  emailContent: EmailContent | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  emailId?: string;
  accountId?: string;
}

const EmailViewer = ({
  emailDetails,
  emailContent,
  isLoading,
  isError,
  error,
  emailId,
  accountId,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<Quill | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [, setEditorContent] = useState<Delta | null>(null);
  const [replyStatus, setReplyStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const replyToMail = useReplyToMail();

  useEffect(() => {
    const handleIframeLoad = () => {
      if (!iframeRef.current) return;
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) return;

      // Add base styles to the iframe document
      const style = iframeDoc.createElement("style");
      style.textContent = `
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 16px;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `;
      iframeDoc.head.appendChild(style);

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

  const handleSendReply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Send button clicked", {
      editorRef: !!editorRef.current,
      emailDetails: !!emailDetails,
      accountId,
      emailId,
    });

    if (!editorRef.current || !emailDetails || !accountId || !emailId) {
      console.log("Send cancelled due to missing data", {
        hasEditor: !!editorRef.current,
        hasEmailDetails: !!emailDetails,
        accountId,
        emailId,
      });
      return;
    }

    const htmlContent = editorRef.current.root.innerHTML;
    setReplyStatus("sending");

    const recipientEmail =
      typeof emailDetails.senderEmail === "string"
        ? emailDetails.senderEmail
        : emailDetails.from;

    const replySubject = emailDetails.subject.startsWith("Re:")
      ? emailDetails.subject
      : `Re: ${emailDetails.subject}`;

    replyToMail.mutate(
      {
        email: recipientEmail,
        subject: replySubject,
        message: htmlContent,
        accountId,
        emailId,
        provider: emailDetails.provider,
      },
      {
        onSuccess: () => {
          setReplyStatus("success");
          editorRef.current?.setText("");
          setEditorContent(null);
          setShowEditor(false);
        },
        onError: () => {
          setReplyStatus("error");
        },
        onSettled: () => {
          setTimeout(() => setReplyStatus("idle"), 3000);
        },
      }
    );
  };

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
    <div className="flex flex-col h-full">
      <div className="flex-none px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold mb-0">
          {emailDetails.subject}
        </h1>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-brand-dark hover:bg-brand-primary/80 rounded-md transition-colors"
          onClick={() => setShowEditor(!showEditor)}
        >
          {showEditor ? "Hide Reply" : "Reply"}
        </button>
      </div>

      <div className="flex-1 min-h-0 p-2 md:p-4 h-[90%]">
        {emailContent?.html ? (
          <div className="h-full">
            <iframe
              title={`Email content for ${emailDetails.subject}`}
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <base target="_blank">
                  </head>
                  <body>
                    ${emailContent.html}
                  </body>
                </html>
              `}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-popups"
              ref={iframeRef}
              style={{ height: "100%", minHeight: "300px" }}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm p-2 md:p-4">
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

      {showEditor && (
        <div className="flex-none pt-2 pb-2 px-4 bg-white">
          <div className="px-4 bg-gray-50 rounded-lg pb-4 shadow-md">
            <QuillEditor
              editorRef={editorRef}
              readOnly={false}
              placeholder="Type Message..."
              className="email-reply-editor"
              showAttachmentTools={true}
              recipientEmail={
                typeof emailDetails.senderEmail === "string"
                  ? emailDetails.senderEmail
                  : emailDetails.from
              }
              onSelectionChange={(range) => {
                console.log("Selection changed:", range);
              }}
              onTextChange={(delta) => {
                console.log("Content changed:", delta);
                setEditorContent(delta);
              }}
            />
            <div className="flex justify-end mt-2">
              {replyStatus === "error" && (
                <div className="text-red-500 mr-4 self-center">
                  Failed to send reply
                </div>
              )}
              {replyStatus === "success" && (
                <div className="text-green-500 mr-4 self-center">
                  Reply sent successfully
                </div>
              )}
              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  replyStatus === "sending"
                    ? "bg-gray-400 cursor-not-allowed"
                    : !accountId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-brand-dark hover:bg-brand-primary/80"
                }`}
                onClick={handleSendReply}
                disabled={replyStatus === "sending" || !accountId}
                title={!accountId ? "Account information is missing" : ""}
              >
                {replyStatus === "sending" ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailViewer;
