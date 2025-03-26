import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "../DashboardClient";

export default async function ProviderDashboardPage({
  params,
  searchParams,
}: {
  params: { provider: string };
  searchParams: { emailId?: string };
}) {
  const { provider } = await params;
  const { emailId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Validate provider
  const validProviders = ["gmail", "outlook"];
  if (!validProviders.includes(provider)) {
    redirect("/dashboard");
  }

  return <DashboardClient initialEmailId={emailId} provider={provider} />;
}
