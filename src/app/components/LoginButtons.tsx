"use client";

import { createSupabaseClient } from "@/utils/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
export default function LoginButtons() {
  const loginWithGoogle = async () => {
    try {
      const supabase = createSupabaseClient();
      toast("Initiating Google login...");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes:
            "email https://www.googleapis.com/auth/gmail.readonly profile",
        },
      });

      if (error) throw error;

      if (!data.url) {
        throw new Error("No OAuth URL returned");
      }

      // Log the full URL for debugging
      console.log("Full OAuth flow:", {
        redirectTo: `${window.location.origin}/auth/callback`,
        oauthUrl: data.url,
      });

      // Instead of relying on Supabase redirect, do it manually
      window.location.href = data.url;

      toast("Redirecting to Google...");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Failed to login",
      });
    }
  };

  const loginWithEmail = () => {
    console.log("Login with Email");
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer hover:bg-blue-600"
        onClick={loginWithGoogle}
      >
        Login with Google
      </button>
      <button
        className="bg-gray-500 text-white p-2 rounded-md cursor-pointer hover:bg-gray-600"
        onClick={loginWithEmail}
      >
        Sign up
      </button>
      <Toaster />
    </div>
  );
}
