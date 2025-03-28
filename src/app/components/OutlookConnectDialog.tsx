"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import useUser from "@/hooks/useUser";

interface OutlookConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OutlookConnectDialog = ({
  open,
  onOpenChange,
}: OutlookConnectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const userData = useUser();

  const handleConnect = async () => {
    if (!userData?.id) return;

    try {
      setIsLoading(true);
      // Redirect to Outlook OAuth flow
      window.location.href = "/api/outlook/authorize";
    } catch (error) {
      console.error("Error starting Outlook connection:", error);
      toast.error("Failed to connect Outlook account");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Outlook Account</DialogTitle>
          <DialogDescription>
            Connect your Outlook or Office 365 email account to read your
            emails.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect with Outlook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutlookConnectDialog;
