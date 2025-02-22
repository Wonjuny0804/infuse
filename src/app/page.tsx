import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButtons from "./components/LoginButtons";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-4xl font-bold text-center w-[60vw]">
        Email Reading AI App
      </div>
      <div className="bg-gray-100 p-4 w-[40vw] h-full flex items-center justify-center">
        <LoginButtons />
      </div>
    </div>
  );
}
