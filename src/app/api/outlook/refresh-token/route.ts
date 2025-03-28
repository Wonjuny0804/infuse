import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accountId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the refresh token from the database
    const { data: account } = await supabase
      .from("email_accounts")
      .select("refresh_token")
      .eq("id", accountId)
      .single();

    if (!account?.refresh_token) {
      throw new Error("No refresh token found");
    }

    // Exchange refresh token for new access token
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID!,
          client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
          refresh_token: account.refresh_token,
          grant_type: "refresh_token",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const { access_token, refresh_token } = await response.json();

    // Update both tokens in the database
    await supabase
      .from("email_accounts")
      .update({
        oauth_token: access_token,
        refresh_token: refresh_token,
      })
      .eq("id", accountId);

    return NextResponse.json({ access_token });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
