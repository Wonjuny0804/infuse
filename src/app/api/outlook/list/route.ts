import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const pageSize = 50;

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

    // Use Microsoft Graph API to fetch emails
    const graphResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages?$top=${pageSize}${
        pageToken ? `&$skip=${pageToken}` : ""
      }&$select=id,subject,from,toRecipients,receivedDateTime,isRead,bodyPreview`,
      {
        headers: {
          Authorization: `Bearer ${account.oauth_token}`,
        },
      }
    );

    if (!graphResponse.ok) {
      if (graphResponse.status === 401) {
        throw new Error("Token expired");
      }
      throw new Error("Failed to fetch emails from Graph API");
    }

    const data = await graphResponse.json();

    const emails = data.value.map(
      (message: {
        id: string;
        bodyPreview: string;
        subject: string;
        from: { emailAddress: { name: string; address: string } };
        toRecipients: { emailAddress: { name: string; address: string } }[];
        receivedDateTime: string;
        isRead: boolean;
      }) => ({
        id: message.id,
        threadId: message.id,
        snippet: message.bodyPreview,
        subject: message.subject,
        from: {
          name: message.from.emailAddress.name,
          address: message.from.emailAddress.address,
        },
        to: message.toRecipients.map(
          (recipient: { emailAddress: { name: string; address: string } }) => ({
            name: recipient.emailAddress.name,
            address: recipient.emailAddress.address,
          })
        ),
        date: message.receivedDateTime,
        isRead: message.isRead,
      })
    );

    return NextResponse.json({
      emails,
      nextPageToken: data["@odata.nextLink"]
        ? (parseInt(pageToken || "0") + pageSize).toString()
        : undefined,
    });
  } catch (error) {
    console.error("Error fetching Outlook emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
