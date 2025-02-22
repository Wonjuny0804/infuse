"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
}
