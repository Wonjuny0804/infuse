import DashboardClient from "@/app/components/DashboardClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Server component to fetch user data
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const displayName = user?.user_metadata.full_name || user?.email;

  return <DashboardClient displayName={displayName} />;
}
