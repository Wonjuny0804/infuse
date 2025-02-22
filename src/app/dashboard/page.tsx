import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";
import GmailConnectPopup from "../components/GmailConnectPopup";
import EmailList from "../components/EmailList";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mb-6">Welcome, {session.user.email}</p>
      <GmailConnectPopup />
      <EmailList />
    </div>
  );
}
