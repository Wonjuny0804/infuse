import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = await context;
  const { id } = await params;
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    const { isUnread } = await request.json();

    // Get access token from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: account } = await supabase
      .from("email_accounts")
      .select("oauth_token")
      .eq("id", accountId)
      .single();

    if (!account?.oauth_token) {
      throw new Error("No access token found");
    }
    oauth2Client.setCredentials({ access_token: account.oauth_token });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      await gmail.users.messages.modify({
        userId: "me",
        id,
        requestBody: {
          removeLabelIds: isUnread ? ["UNREAD"] : [],
          addLabelIds: isUnread ? [] : ["UNREAD"],
        },
      });
      console.log("=== success modify message ===");

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      if (
        error instanceof GaxiosError &&
        error.message?.includes("Invalid Credentials")
      ) {
        // Retry the request...
        await gmail.users.messages.modify({
          userId: "me",
          id,
          requestBody: {
            removeLabelIds: isUnread ? ["UNREAD"] : [],
            addLabelIds: isUnread ? [] : ["UNREAD"],
          },
        });

        return NextResponse.json({ success: true });
      }
      throw error;
    }
  } catch (error) {
    console.error("Gmail API error /read:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
