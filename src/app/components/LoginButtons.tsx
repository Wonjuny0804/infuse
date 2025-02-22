"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginButtons() {
  const loginWithGoogle = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
        scopes: "email https://www.googleapis.com/auth/gmail.readonly profile",
      },
    });
    console.log("Login with Google", { data, error });
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
    </div>
  );
}
