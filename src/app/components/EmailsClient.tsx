import React from "react";
import Link from "next/link";
import { Email } from "@/types/email";

interface Props {
  emails: Email[];
  providers: string[];
  selectedAccount?: string;
}

const EmailsClient: React.FC<Props> = ({ emails, selectedAccount }) => {
  // Filter emails by provider if selectedProvider is provided
  const filteredEmails = selectedAccount
    ? emails.filter((email) => email.accountId === selectedAccount)
    : emails;

  console.log("filteredEmails", filteredEmails, emails);

  return (
    <div className="flex flex-col h-full">
      {/* Email List */}
      <div className="flex-grow overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No emails found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmails.map((email) => (
              <Link
                href={`/dashboard/emails?provider=${email.provider}&emailId=${email.id}`}
                key={email.id}
                className={`block p-3 border rounded-lg hover:bg-gray-50 ${
                  !email.read ? "border-blue-200 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`font-medium ${
                      !email.read ? "font-semibold" : ""
                    }`}
                  >
                    {email.from}
                  </span>
                  <span className="text-sm text-gray-500">{email.date}</span>
                </div>
                <div className="mt-1">
                  <h3 className={`${!email.read ? "font-semibold" : ""}`}>
                    {email.subject}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {email.preview}
                  </p>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Provider: {email.provider}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailsClient;
