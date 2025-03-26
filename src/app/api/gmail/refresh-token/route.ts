import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accountId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: account } = await supabase
      .from("email_accounts")
      .select("refresh_token")
      .eq("id", accountId)
      .single();

    if (!account?.refresh_token) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 400 }
      );
    }

    // Exchange refresh token for new access token with Google
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: account.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.log(
        "=== response from google trying to refresh token ===",
        response
      );
      throw new Error("Failed to refresh Google token");
    }

    const data = await response.json();

    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
