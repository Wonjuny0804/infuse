"use client";

import { createSupabaseClient } from "@/lib/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useState } from "react";

const SCOPES = [
  "email",
  "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "profile",
];

const LoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const loginWithGoogle = async () => {
    try {
      const supabase = createSupabaseClient();
      toast("Initiating Google login...");
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: SCOPES.join(" "),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      setIsLoading(false);

      if (error) throw error;

      if (!data.url) {
        throw new Error("No OAuth URL returned");
      }

      window.location.href = data.url;

      toast("Redirecting to Google...");
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Failed to login",
      });
    }
  };

  const loginWithEmail = () => {
    // TODO: Implement email login
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
      {isLoading && <div className="text-center">Loading...</div>}
    </div>
  );
};

export default LoginButtons;
