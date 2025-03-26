import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  // Get the URL to redirect back to after auth
  const returnTo = searchParams.get("returnTo") ?? "/dashboard";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${
        new URL(request.url).origin
      }/auth/callback?next=${returnTo}`,
      scopes:
        "email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly profile",
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${new URL(request.url).origin}/auth/auth-code-error`
    );
  }

  return NextResponse.redirect(data.url);
}
