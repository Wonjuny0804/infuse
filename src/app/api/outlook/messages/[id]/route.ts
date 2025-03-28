import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    const { params } = context;
    const { id } = params;

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

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${id}?$select=id,subject,body,from,toRecipients,receivedDateTime,isRead`,
      {
        headers: {
          Authorization: `Bearer ${account.oauth_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch email");
    }

    const message = await response.json();

    return NextResponse.json({
      id: message.id,
      subject: message.subject,
      body: message.body.content,
      from: {
        name: message.from.emailAddress.name,
        address: message.from.emailAddress.address,
      },
      to: message.toRecipients.map((recipient: unknown) => ({
        name: (recipient as { emailAddress: { name: string } }).emailAddress
          .name,
        address: (recipient as { emailAddress: { address: string } })
          .emailAddress.address,
      })),
      date: message.receivedDateTime,
      isRead: message.isRead,
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}
