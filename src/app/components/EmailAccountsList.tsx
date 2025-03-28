"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import Image from "next/image";
import useUser from "@/hooks/useUser";
import createClient from "@/lib/supabase/client";
import YahooConnectDialog from "./YahooConnectDialog";
import OutlookConnectDialog from "./OutlookConnectDialog";

interface EmailAccount {
  id: string;
  provider: string;
  email_address: string;
  oauth_token: string;
}

const EMAIL_PROVIDERS = [
  {
    id: "gmail",
    name: "Gmail",
    path: "/auth/gmail",
    icon: "/icons/gmail.svg",
  },
  {
    id: "outlook",
    name: "Outlook",
    path: "/auth/outlook",
    icon: "/icons/outlook.svg",
  },
  {
    id: "yahoo",
    name: "Yahoo Mail",
    path: "/auth/yahoo",
    icon: "/icons/yahoo.svg",
  },
  {
    id: "naver",
    name: "Naver Mail",
    path: "/auth/naver",
    icon: "/icons/naver.svg",
  },
] as const;

const PROVIDER_ICONS: Record<string, string> = {
  gmail: "/icons/gmail.svg",
  google: "/icons/gmail.svg", // for backward compatibility
  outlook: "/icons/outlook.svg",
  microsoft: "/icons/outlook.svg", // for backward compatibility
  yahoo: "/icons/yahoo.svg",
  naver: "/icons/naver.svg",
};

const getProviderIcon = (provider: string): string => {
  return PROVIDER_ICONS[provider.toLowerCase()] || "/icons/default-mail.svg";
};

const EmailAccountsList = ({
  onSelect,
}: {
  onSelect: (account: EmailAccount) => void;
}) => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [showYahooDialog, setShowYahooDialog] = useState(false);
  const [showOutlookDialog, setShowOutlookDialog] = useState(false);

  const userData = useUser();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        if (!userData) return;
        const supabase = createClient();

        const { data } = await supabase
          .from("email_accounts")
          .select("id, provider, email_address, oauth_token")
          .order("created_at", { ascending: false })
          .eq("user_id", userData?.id);

        if (data) {
          setAccounts(data);
          if (data.length > 0) {
            setSelectedId(data[0].id);
            onSelect(data[0]);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAccounts();
  }, [onSelect, userData]);

  const handleAddAccount = useCallback((path: string) => {
    window.location.href = path;
  }, []);

  const handleProviderSelect = (providerId: string) => {
    if (providerId === "yahoo") {
      setShowYahooDialog(true);
    } else if (providerId === "outlook") {
      setShowOutlookDialog(true);
    } else {
      handleAddAccount(`/auth/${providerId}`);
    }
  };

  return (
    <div className="border-r border-gray-200 h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Email Accounts</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
              title="Add email account"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {EMAIL_PROVIDERS.map((provider) => (
              <DropdownMenuItem
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className="flex items-center gap-2"
              >
                <div className="relative w-5 h-5">
                  <Image
                    src={provider.icon}
                    alt={`${provider.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                {provider.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`p-3 rounded-lg cursor-pointer ${
              selectedId === account.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              setSelectedId(account.id);
              onSelect(account);
            }}
          >
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <Image
                  src={getProviderIcon(account.provider)}
                  alt={`${account.provider} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="font-medium">{account.email_address}</div>
            </div>
          </div>
        ))}
      </div>

      <YahooConnectDialog
        open={showYahooDialog}
        onOpenChange={setShowYahooDialog}
      />
      <OutlookConnectDialog
        open={showOutlookDialog}
        onOpenChange={setShowOutlookDialog}
      />
    </div>
  );
};

export default EmailAccountsList;
