import { NextResponse } from "next/server";
import { google } from "googleapis";
import { refreshGmailToken } from "@/utils/oauth/refreshToken";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "No authorization token" },
      { status: 401 }
    );
  }

  try {
    let accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return NextResponse.json(
        { error: "Invalid authorization token" },
        { status: 401 }
      );
    }
    const { id: messageId } = await context.params;
    const { isUnread } = await request.json();

    console.log("Modifying message:", { messageId, isUnread });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      const result = await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          removeLabelIds: isUnread ? [] : ["UNREAD"],
          addLabelIds: isUnread ? ["UNREAD"] : [],
        },
      });

      console.log("Modify result:", result.data);
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 401) {
        const accountId = request.headers.get("X-Account-Id");
        if (!accountId) {
          throw new Error("Account ID required for token refresh");
        }

        const newToken = await refreshGmailToken(accountId);
        if (!newToken) {
          throw new Error("Failed to refresh token");
        }
        accessToken = newToken;

        oauth2Client.setCredentials({ access_token: accessToken });
        await gmail.users.messages.modify({
          userId: "me",
          id: messageId,
          requestBody: {
            removeLabelIds: isUnread ? [] : ["UNREAD"],
            addLabelIds: isUnread ? ["UNREAD"] : [],
          },
        });

        return NextResponse.json({ success: true });
      }
      throw error;
    }
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json(
      { error: "Failed to update message status" },
      { status: 500 }
    );
  }
}
