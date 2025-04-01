"use client";

import React, { useState, useRef } from "react";
import Quill from "quill";
import QuillEditor from "./QuillEditor";
import { X, Paperclip, Send } from "lucide-react";
import useSendMail from "@/hooks/useSendMail";
import useEmailAccounts from "@/hooks/useEmailAccounts";
import useUser from "@/hooks/useUser";

interface ComposeEmailProps {
  accountId?: string;
  onClose?: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ accountId, onClose }) => {
  const user = useUser();
  const { data: accounts = [] } = useEmailAccounts(user?.id || "");

  const [to, setTo] = useState<string>("");
  const [cc, setCc] = useState<string>("");
  const [bcc, setBcc] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showCcBcc, setShowCcBcc] = useState<boolean>(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accountId || ""
  );
  const [attachments, setAttachments] = useState<
    Array<{
      filename: string;
      content: Blob | string;
      contentType?: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const editorRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMail = useSendMail();

  // Handler for text editor content changes
  const handleTextChange = () => {
    if (editorRef.current) {
      setMessage(editorRef.current.root.innerHTML);
    }
  };

  // Handler for file attachments
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map((file) => ({
        filename: file.name,
        content: file,
        contentType: file.type,
      }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!to || !subject || !message) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (!selectedAccountId) {
      setError("Please select an account to send from");
      setIsLoading(false);
      return;
    }

    try {
      const selectedAccount = accounts.find(
        (acc) => acc.id === selectedAccountId
      );

      await sendMail.mutateAsync({
        email: to,
        subject,
        message,
        accountId: selectedAccountId,
        provider: selectedAccount?.provider,
        cc: cc || undefined,
        bcc: bcc || undefined,
        isHtml: true,
        attachments,
      });

      // Clear form on success
      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setMessage("");
      setAttachments([]);
      if (editorRef.current) {
        editorRef.current.setText("");
      }
      setSuccess(true);

      // Close the dialog after a short delay
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Failed to send email:", error);
      setError("Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <form
          id="compose-email-form"
          onSubmit={handleSubmit}
          className="space-y-4 h-full flex flex-col"
        >
          {/* Form fields */}
          <div className="space-y-4 flex-1">
            {/* Email Account Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.email_address} ({account.provider})
                  </option>
                ))}
              </select>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="recipient@example.com"
                required
              />
            </div>

            {/* CC/BCC Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showCcBcc ? "Hide Cc/Bcc" : "Show Cc/Bcc"}
              </button>
            </div>

            {/* CC/BCC fields */}
            {showCcBcc && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cc
                  </label>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cc@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bcc
                  </label>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="bcc@example.com"
                  />
                </div>
              </>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subject"
                required
              />
            </div>

            {/* Text Editor */}
            <div className="border rounded-md flex-1">
              <QuillEditor
                editorRef={editorRef}
                onTextChange={handleTextChange}
                placeholder="Compose your message here..."
                className="min-h-[200px]"
              />
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </div>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div className="text-sm truncate max-w-[200px]">
                        {attachment.filename}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Error/Success messages */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-md">
                Email sent successfully!
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-4 py-2 text-gray-700 flex items-center gap-2 hover:bg-gray-100 rounded-md"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach Files</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || sendMail.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || sendMail.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEmail;
