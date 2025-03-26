import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteAccountButton from "@/app/components/DeleteAccountButton";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* Other settings components */}

        <div className="pt-6 border-t">
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
  );
}
