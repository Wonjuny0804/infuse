import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteAccountButton from "@/app/components/DeleteAccountButton";
import DisplayNameForm from "@/app/components/DisplayNameForm";
import Navigation from "../components/Navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  // Get the user's current display name
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.display_name;

  return (
    <div className="">
      <div className="flex flex-col h-screen">
        <div className="flex justify-between items-center p-4 border-b">
          <Navigation />
        </div>

        <div className="space-y-6 p-12">
          {/* Profile Section */}
          <div className="bg-white p-8 rounded-lg border">
            <h2 className="text-lg font-semibold mb-8">Profile Settings</h2>
            <DisplayNameForm initialDisplayName={displayName} />
          </div>

          {/* Danger Zone Section */}
          <div className="pt-8 border-t">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <DeleteAccountButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
