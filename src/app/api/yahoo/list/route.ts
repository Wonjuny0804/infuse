import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ImapFlow } from "imapflow";

export async function GET(request: Request) {
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const pageToken = url.searchParams.get("pageToken");

    // Get access token from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: account } = await supabase
      .from("email_accounts")
      .select("oauth_token, email_address")
      .eq("id", accountId)
      .single();

    if (!account?.oauth_token) {
      throw new Error("No access token found");
    }

    // Create IMAP client
    const client = new ImapFlow({
      host: "imap.mail.yahoo.com",
      port: 993,
      secure: true,
      auth: {
        user: account.email_address,
        accessToken: account.oauth_token,
      },
    });

    await client.connect();
    await client.mailboxOpen("INBOX");

    // Calculate pagination
    const pageSize = 50;
    const start = pageToken ? parseInt(pageToken) : 1;

    // Fetch emails
    const messages = await client.fetch(`${start}:${start + pageSize - 1}`, {
      uid: true,
      flags: true,
      envelope: true,
      bodyStructure: true,
    });

    const emails = [];
    for await (const message of messages) {
      emails.push({
        id: message.uid.toString(),
        threadId: message.uid.toString(),
        snippet: "",
        subject: message.envelope.subject,
        from: message.envelope.from[0],
        to: message.envelope.to,
        date: message.envelope.date,
        isRead: message.flags.has("\\Seen"),
      });
    }

    await client.logout();

    return NextResponse.json({
      messages: emails,
      nextPageToken: (start + pageSize).toString(),
    });
  } catch (error) {
    console.error("Error fetching Yahoo emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
