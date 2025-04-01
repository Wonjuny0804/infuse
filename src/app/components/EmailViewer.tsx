"use client";

import React, { useEffect, useRef, useState } from "react";
import { Email, EmailContent } from "@/types/email";
import dynamic from "next/dynamic";
import Quill, { Delta } from "quill";
import useSendMail from "@/hooks/useSendMail";
import Image from "next/image";

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

// New interface for recipients
interface Recipient {
  email: string;
  type: "to" | "cc" | "bcc";
}

// Interface for attachment objects
interface Attachment {
  file: File;
  id: string;
  previewUrl: string | null;
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
  // New state for recipients
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState<string>("");
  const [recipientType, setRecipientType] = useState<"to" | "cc" | "bcc">("to");
  const [showCcBcc, setShowCcBcc] = useState(false);
  // New state for attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State for file validation
  const [fileError, setFileError] = useState<string | null>(null);

  // Maximum file size (25MB)
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

  const sendMail = useSendMail();

  // Reset recipients when email changes
  useEffect(() => {
    setRecipients([]);
    setShowCcBcc(false);
    setAttachments([]);
  }, [emailDetails?.id]);

  // Set original sender as recipient when reply is opened
  useEffect(() => {
    if (showEditor && emailDetails) {
      const originalSender =
        typeof emailDetails.senderEmail === "string"
          ? emailDetails.senderEmail
          : emailDetails.from;

      // Set the original sender as the first recipient if recipients list is empty
      if (recipients.length === 0 && originalSender) {
        setRecipients([{ email: originalSender, type: "to" }]);
      }
    }
  }, [showEditor, emailDetails, recipients.length]);

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

  // Add handlers for drag and drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer && e.dataTransfer.files) {
        const files = Array.from(e.dataTransfer.files);
        validateAndHandleFiles(files);
      }
    };

    const dropZone = dropZoneRef.current;
    if (dropZone && showEditor) {
      dropZone.addEventListener("dragover", handleDragOver);
      dropZone.addEventListener("dragleave", handleDragLeave);
      dropZone.addEventListener("drop", handleDrop);
    }

    return () => {
      if (dropZone) {
        dropZone.removeEventListener("dragover", handleDragOver);
        dropZone.removeEventListener("dragleave", handleDragLeave);
        dropZone.removeEventListener("drop", handleDrop);
      }
    };
  }, [showEditor]);

  // Function to check if a file is an image
  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  // Function to get a preview URL for an image file
  const getImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Validate files before adding them
  const validateAndHandleFiles = (files: File[]) => {
    setFileError(null);

    // Check for large files
    const largeFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (largeFiles.length > 0) {
      setFileError(
        `Some files exceed the maximum size of 25MB: ${largeFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      // Only add the valid files
      const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);
      if (validFiles.length > 0) {
        handleFiles(validFiles);
      }
    } else {
      handleFiles(files);
    }
  };

  // Update the existing handleFiles function
  const handleFiles = (files: File[]) => {
    const newAttachments = files.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      previewUrl: isImageFile(file) ? getImagePreviewUrl(file) : null,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  // Clean up object URLs when component unmounts or attachments change
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  // Update the removeAttachment function to clean up preview URL
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      // Get the attachment to be removed
      const attachmentToRemove = prev[index];

      // Revoke the object URL if it exists
      if (attachmentToRemove?.previewUrl) {
        URL.revokeObjectURL(attachmentToRemove.previewUrl);
      }

      // Filter out the attachment
      return prev.filter((_, i) => i !== index);
    });
  };

  // Format file size in a readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Update truncateFilename function to ensure it's more robust
  const truncateFilename = (filename: string, maxLength = 20): string => {
    if (!filename) return "";
    if (filename.length <= maxLength) return filename;

    const extension = filename.includes(".")
      ? filename.slice(filename.lastIndexOf("."))
      : "";
    const nameWithoutExt = filename.slice(
      0,
      filename.length - extension.length
    );

    return (
      nameWithoutExt.slice(0, maxLength - extension.length - 3) +
      "..." +
      extension
    );
  };

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.some((r) => r.email === newRecipient)) {
      setRecipients([
        ...recipients,
        { email: newRecipient, type: recipientType },
      ]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((recipient) => recipient.email !== email));
  };

  const handleSendReply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Send button clicked", {
      editorRef: !!editorRef.current,
      emailDetails: !!emailDetails,
      accountId,
      emailId,
      recipients,
      attachments: attachments.length,
    });

    if (
      !editorRef.current ||
      !emailDetails ||
      !accountId ||
      !emailId ||
      recipients.length === 0
    ) {
      console.log("Send cancelled due to missing data", {
        hasEditor: !!editorRef.current,
        hasEmailDetails: !!emailDetails,
        accountId,
        emailId,
        recipientsCount: recipients.length,
      });
      return;
    }

    const htmlContent = editorRef.current.root.innerHTML;
    setReplyStatus("sending");

    const replySubject = emailDetails?.subject
      ? emailDetails.subject.startsWith("Re:")
        ? emailDetails.subject
        : `Re: ${emailDetails.subject}`
      : "Re: No Subject";

    // Extract recipients by type
    const toRecipients = recipients
      .filter((r) => r.type === "to")
      .map((r) => r.email);
    const ccRecipients = recipients
      .filter((r) => r.type === "cc")
      .map((r) => r.email);
    const bccRecipients = recipients
      .filter((r) => r.type === "bcc")
      .map((r) => r.email);

    // Convert File objects to the format expected by the API
    const formattedAttachments = attachments.map((attachment) => ({
      filename: attachment.file.name,
      content: attachment.file,
      contentType: attachment.file.type,
    }));

    sendMail.mutate(
      {
        email: toRecipients.join(","),
        cc: ccRecipients.join(","),
        bcc: bccRecipients.join(","),
        subject: replySubject,
        message: htmlContent,
        isHtml: true,
        accountId,
        emailId,
        provider: emailDetails.provider,
        attachments: formattedAttachments,
      },
      {
        onSuccess: () => {
          setReplyStatus("success");
          editorRef.current?.setText("");
          setEditorContent(null);
          setShowEditor(false);
          setRecipients([]);
          setAttachments([]);
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

  // Function to handle the manual file selection
  const handleAttachmentButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      validateAndHandleFiles(files);
      // Clear the input value so the same file can be selected again
      e.target.value = "";
    }
  };

  // Effect to load images with account ID headers
  useEffect(() => {
    if (!emailContent?.attachments || !accountId) return;

    const loadImagesWithHeaders = async () => {
      const imageAttachments =
        emailContent.attachments?.filter((att) =>
          att.contentType?.startsWith("image/")
        ) || [];

      for (const attachment of imageAttachments) {
        try {
          // Include accountId as query parameter
          const attachmentUrl = `/api/gmail/messages/${emailId}/attachments/${attachment.id}?accountId=${accountId}`;
          const response = await fetch(attachmentUrl);

          if (!response.ok) {
            console.error(
              `Failed to load image: ${response.status} ${response.statusText}`
            );
            continue;
          }

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          // Find the image element and update its src
          const imgElement = document.querySelector(
            `img[alt="${attachment.filename}"]`
          ) as HTMLImageElement;
          if (imgElement) {
            imgElement.src = objectUrl;
          }
        } catch (error) {
          console.error(`Error loading image ${attachment.id}:`, error);
        }
      }
    };

    loadImagesWithHeaders();

    return () => {
      // Clean up any object URLs on unmount (though we don't track them individually here)
      // This is just good practice
    };
  }, [emailContent?.attachments, emailId, accountId]);

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
        <div className="flex-none border-t p-3 md:p-4">
          <h2 className="font-semibold mb-2 text-sm">Attachments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {emailContent.attachments.map((attachment) => {
              const isImage = attachment.contentType?.startsWith("image/");
              // Include accountId as query parameter
              const attachmentUrl = `/api/gmail/messages/${emailId}/attachments/${attachment.id}?accountId=${accountId}`;

              return (
                <div
                  key={attachment.id || attachment.filename}
                  className="flex flex-col border rounded-md bg-gray-50 overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
                >
                  {isImage ? (
                    <div className="h-24 overflow-hidden relative flex items-center justify-center bg-gray-100">
                      <img
                        // Use data URI for placeholder
                        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                        alt={attachment.filename}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          // Show fallback on error
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement("div");
                            fallback.className = "text-center p-2";
                            fallback.innerHTML = `
                              <svg class="w-8 h-8 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="mt-1 text-xs font-medium text-gray-600">Image Preview</p>
                            `;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-2 flex items-center justify-center h-24">
                      <div className="text-center">
                        <svg
                          className="w-8 h-8 mx-auto text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="mt-1 text-xs font-medium text-gray-900 truncate px-1">
                          {attachment.filename}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-1.5 flex justify-between items-center border-t bg-white">
                    <div className="truncate pr-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.size > 0
                          ? formatFileSize(attachment.size)
                          : ""}
                      </p>
                    </div>
                    <a
                      href={attachmentUrl}
                      download={attachment.filename}
                      className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="Download attachment"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        // Use the Fetch API without custom headers, since we have the accountId in the URL
                        fetch(attachmentUrl)
                          .then((response) => {
                            if (!response.ok)
                              throw new Error("Network response was not ok");
                            return response.blob();
                          })
                          .then((blob) => {
                            // Create a download link
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = attachment.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          })
                          .catch((error) => {
                            console.error(
                              "Error downloading attachment:",
                              error
                            );
                            alert(
                              "Failed to download attachment. Please try again."
                            );
                          });
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showEditor && (
        <div className="flex-none pt-2 pb-2 px-4 bg-white">
          <div
            ref={dropZoneRef}
            className={`px-4 bg-gray-50 rounded-lg pb-4 shadow-md relative ${
              isDragging ? "ring-2 ring-blue-400" : ""
            }`}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-blue-100 bg-opacity-70 flex items-center justify-center rounded-lg z-10">
                <p className="text-blue-800 font-medium text-lg">
                  Drop files to attach
                </p>
              </div>
            )}
            {/* Recipients Management Section */}
            <div className="py-3">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">To:</span>
                  <div className="flex flex-wrap gap-1 items-center">
                    {recipients
                      .filter((r) => r.type === "to")
                      .map((recipient) => (
                        <div
                          key={recipient.email}
                          className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-sm flex items-center"
                        >
                          <span>{recipient.email}</span>
                          <button
                            onClick={() =>
                              handleRemoveRecipient(recipient.email)
                            }
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    <input
                      type="email"
                      value={recipientType === "to" ? newRecipient : ""}
                      onChange={(e) => {
                        setNewRecipient(e.target.value);
                        setRecipientType("to");
                      }}
                      placeholder="Add recipient"
                      className="border-none outline-none bg-transparent flex-grow min-w-[150px]"
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" ||
                            e.key === "Tab" ||
                            e.key === " ") &&
                          newRecipient
                        ) {
                          e.preventDefault();
                          handleAddRecipient();
                        }
                      }}
                    />
                  </div>
                </div>
                <button
                  className="ml-auto text-blue-600 text-sm"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                >
                  {showCcBcc ? "Hide" : "Cc/Bcc"}
                </button>
              </div>

              {showCcBcc && (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 mr-2 w-8">Cc:</span>
                    <div className="flex flex-wrap gap-1 items-center">
                      {recipients
                        .filter((r) => r.type === "cc")
                        .map((recipient) => (
                          <div
                            key={recipient.email}
                            className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-sm flex items-center"
                          >
                            <span>{recipient.email}</span>
                            <button
                              onClick={() =>
                                handleRemoveRecipient(recipient.email)
                              }
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      <input
                        type="email"
                        value={recipientType === "cc" ? newRecipient : ""}
                        onChange={(e) => {
                          setNewRecipient(e.target.value);
                          setRecipientType("cc");
                        }}
                        placeholder="Add Cc recipient"
                        className="border-none outline-none bg-transparent flex-grow min-w-[150px]"
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" ||
                              e.key === "Tab" ||
                              e.key === " ") &&
                            newRecipient
                          ) {
                            e.preventDefault();
                            handleAddRecipient();
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 mr-2 w-8">Bcc:</span>
                    <div className="flex flex-wrap gap-1 items-center">
                      {recipients
                        .filter((r) => r.type === "bcc")
                        .map((recipient) => (
                          <div
                            key={recipient.email}
                            className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-sm flex items-center"
                          >
                            <span>{recipient.email}</span>
                            <button
                              onClick={() =>
                                handleRemoveRecipient(recipient.email)
                              }
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      <input
                        type="email"
                        value={recipientType === "bcc" ? newRecipient : ""}
                        onChange={(e) => {
                          setNewRecipient(e.target.value);
                          setRecipientType("bcc");
                        }}
                        placeholder="Add Bcc recipient"
                        className="border-none outline-none bg-transparent flex-grow min-w-[150px]"
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" ||
                              e.key === "Tab" ||
                              e.key === " ") &&
                            newRecipient
                          ) {
                            e.preventDefault();
                            handleAddRecipient();
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <QuillEditor
              editorRef={editorRef}
              readOnly={false}
              placeholder="Type Message..."
              className="email-reply-editor"
              onSelectionChange={(range) => {
                console.log("Selection changed:", range);
              }}
              onTextChange={(delta) => {
                console.log("Content changed:", delta);
                setEditorContent(delta);
              }}
            />

            {attachments.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Attachments ({attachments.length})
                </h3>
                <ul className="space-y-1">
                  {attachments.map((attachment, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-1 bg-white rounded border border-gray-200"
                    >
                      <div className="flex items-center overflow-hidden">
                        {attachment.previewUrl ? (
                          <Image
                            src={attachment.previewUrl}
                            alt={attachment.file.name}
                            className="h-8 w-8 mr-2 object-cover rounded"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span className="mr-2">
                            <svg
                              className="h-4 w-4 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                        <span
                          className="text-sm text-gray-700 truncate"
                          title={attachment.file.name}
                        >
                          {truncateFilename(attachment.file.name, 25)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {formatFileSize(attachment.file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add a button for attaching files */}
            <div className="flex items-center mt-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                onClick={handleAttachmentButtonClick}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-300"
              >
                <svg
                  className="h-5 w-5 mr-2 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Attach Files
              </button>
            </div>

            {/* Display file error message if any */}
            {fileError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{fileError}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setFileError(null)}
                        className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
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
                  replyStatus === "sending" || recipients.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : !accountId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-brand-dark hover:bg-brand-primary/80"
                }`}
                onClick={handleSendReply}
                disabled={
                  replyStatus === "sending" ||
                  !accountId ||
                  recipients.length === 0
                }
                title={
                  !accountId
                    ? "Account information is missing"
                    : recipients.length === 0
                    ? "Add at least one recipient"
                    : ""
                }
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
