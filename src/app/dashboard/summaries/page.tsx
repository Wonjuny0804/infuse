import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SummariesClient from "./SummariesClient";

const SummariesPage = async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-screen">
      <SummariesClient />
    </div>
  );
};

export default SummariesPage;
