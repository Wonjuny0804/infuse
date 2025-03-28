"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import createClient from "@/lib/supabase/client";
import useUser from "@/hooks/useUser";

interface YahooConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const YahooConnectDialog = ({
  open,
  onOpenChange,
}: YahooConnectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const router = useRouter();
  const userData = useUser();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      // Test IMAP connection first
      const response = await fetch("/api/yahoo/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: appPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to Yahoo Mail");
      }

      // If connection successful, save to database
      const { error } = await supabase.from("email_accounts").insert({
        provider: "yahoo",
        email_address: email,
        oauth_token: appPassword, // Store app password as token
      });

      if (error) throw error;

      toast.success("Yahoo Mail account connected successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error connecting Yahoo account:", error);
      toast.error("Failed to connect Yahoo Mail account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Yahoo Mail Account</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              You&apos;ll need to use an App Password to connect your Yahoo
              account. Your regular Yahoo password won&apos;t work.
            </p>
            <p>
              <a
                href="https://help.yahoo.com/kb/generate-manage-third-party-passwords-sln15241.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                How to generate an app password →
              </a>
            </p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConnect}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Yahoo Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@yahoo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="appPassword">
                App Password{" "}
                <span className="text-sm text-gray-500">(16 characters)</span>
              </Label>
              <Input
                id="appPassword"
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={appPassword}
                onChange={(e) => {
                  // Remove any spaces or dashes the user might enter
                  const cleaned = e.target.value.replace(/[-\s]/g, "");
                  setAppPassword(cleaned);
                }}
                required
                pattern=".{16,16}"
                title="App password must be exactly 16 characters"
                maxLength={16}
              />
              <p className="text-sm text-gray-500 mt-1">
                This should be a 16-character app password from your Yahoo
                Account settings, not your regular Yahoo password.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || appPassword.length !== 16}
            >
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default YahooConnectDialog;
