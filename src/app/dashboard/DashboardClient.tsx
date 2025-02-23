"use client";

import { useState } from "react";
import LogoutButton from "../components/LogoutButton";
import GmailConnectPopup from "../components/GmailConnectPopup";
import EmailAccountsList from "../components/EmailAccountsList";
import EmailList from "../components/EmailList";
import EmailViewer from "../components/EmailViewer";

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

export default function DashboardClient() {
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount>();
  const [selectedEmail, setSelectedEmail] = useState<Email>();

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <GmailConnectPopup />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/6">
          <EmailAccountsList onSelect={setSelectedAccount} />
        </div>
        <div className="w-1/4">
          <EmailList
            account={selectedAccount}
            onSelectEmail={setSelectedEmail}
          />
        </div>
        <div className="flex-1">
          <EmailViewer email={selectedEmail} account={selectedAccount} />
        </div>
      </div>
    </div>
  );
}
