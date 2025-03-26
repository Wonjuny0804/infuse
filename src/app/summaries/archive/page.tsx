import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AudioSummaryArchive from "./AudioSummaryArchive";

const ArchivePage = async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  return <AudioSummaryArchive />;
};

export default ArchivePage;
