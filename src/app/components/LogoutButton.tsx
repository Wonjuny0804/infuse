"use client";

import createClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const LogoutButton = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear React Query cache on logout
    queryClient.clear();
    router.refresh();
    router.push("/signin");
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
};

export default LogoutButton;
