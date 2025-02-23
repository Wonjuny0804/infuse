import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "No authorization token" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const pageToken = url.searchParams.get("pageToken");

  try {
    const accessToken = authHeader.split(" ")[1];
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 30,
      pageToken: pageToken || undefined,
    });

    const emails = await Promise.all(
      response.data.messages?.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
        });

        const headers = email.data.payload?.headers;
        return {
          id: email.data.id,
          subject: headers?.find((h) => h.name === "Subject")?.value,
          from: headers?.find((h) => h.name === "From")?.value,
          snippet: email.data.snippet,
          date: headers?.find((h) => h.name === "Date")?.value,
          isUnread: email.data.labelIds?.includes("UNREAD") || false,
        };
      }) ?? []
    );

    return NextResponse.json({
      emails,
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
