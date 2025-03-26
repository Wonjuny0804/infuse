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
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import createClient from "@/lib/supabase/client";
import { toast } from "sonner";

const DeleteAccountButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Get current user to ensure we're authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Call the edge function with proper headers
      // when successful, will return { success: true }
      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        // Clear all local data
        queryClient.clear();
        await supabase.auth.signOut();
        window.localStorage.clear();

        toast.success("Account deleted successfully");
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="bg-red-500 hover:bg-red-600"
      >
        Delete Account
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently delete all your data, including
              email connections and summaries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteAccountButton;
