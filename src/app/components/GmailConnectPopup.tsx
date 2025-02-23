"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GmailConnectPopup() {
  const [open, setOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkGmailConnection = async () => {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("email_accounts")
          .select("*")
          .eq("user_id", user.id)
          .eq("provider", "gmail")
          .single();

        setIsConnected(!!data);
        setOpen(!data);
      }
    };

    checkGmailConnection();
  }, []);

  if (!open || isConnected) return null;

  const handleGmailConnect = () => {
    window.location.href = "/auth/gmail";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Gmail Account</DialogTitle>
          <DialogDescription>
            To use the Email Reading AI App, you need to connect your Gmail
            account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Later
          </Button>
          <Button onClick={handleGmailConnect}>Connect Gmail</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
