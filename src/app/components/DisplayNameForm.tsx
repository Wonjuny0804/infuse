"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import createClient from "@/lib/supabase/client";

const DisplayNameForm = ({
  initialDisplayName,
}: {
  initialDisplayName?: string;
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (error) throw error;

      toast.success("Display name updated successfully");
    } catch (error) {
      console.error("Error updating display name:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update display name"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="text-sm font-medium text-gray-700"
        >
          Display Name
        </label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Display Name"}
      </Button>
    </form>
  );
};

export default DisplayNameForm;
