import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SummariesClient from "./SummariesClient";
import Navigation from "../components/Navigation";

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
      <div className="flex justify-between items-center p-4 border-b">
        <Navigation />
      </div>
      <SummariesClient />
    </div>
  );
};

export default SummariesPage;
