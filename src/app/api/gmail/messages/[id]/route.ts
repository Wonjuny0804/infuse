import { NextResponse } from "next/server";
import { google } from "googleapis";
import { gmail_v1 } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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

    const { params } = await context;
    const { id } = await params;

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
      const message = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });

      let htmlContent = "";
      let textContent = "";
      const attachments: Attachment[] = [];

      const findBodyContent = (part: gmail_v1.Schema$MessagePart) => {
        // Check if this part has a body with data
        if (part.body?.data) {
          const content = Buffer.from(part.body.data, "base64").toString();
          if (part.mimeType === "text/html") {
            htmlContent = content;
          } else if (part.mimeType === "text/plain") {
            textContent = content;
          }
        }

        // Check for attachments
        if (part.body?.attachmentId && part.filename) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            contentType: part.mimeType || "application/octet-stream",
            size: part.body.size || 0,
          });
        }

        // Recursively check nested parts
        if (Array.isArray(part.parts)) {
          part.parts.forEach(findBodyContent);
        }
      };

      // Start with the message payload
      if (message.data.payload) {
        findBodyContent(message.data.payload);
      }

      return NextResponse.json({
        headers: {
          from: message.data.payload?.headers?.find((h) => h.name === "From")
            ?.value,
          to: message.data.payload?.headers?.find((h) => h.name === "To")
            ?.value,
          cc: message.data.payload?.headers?.find((h) => h.name === "Cc")
            ?.value,
          date: message.data.payload?.headers?.find((h) => h.name === "Date")
            ?.value,
        },
        html: htmlContent,
        text: textContent,
        attachments,
        threadId: message.data.threadId,
        labelIds: message.data.labelIds,
      });
    } catch (error: unknown) {
      if (
        error instanceof GaxiosError &&
        error.message?.includes("Invalid Credentials")
      ) {
        // call the api/gmail/refresh-token route to refresh the token

        try {
          const response = await fetch(`${baseUrl}/api/gmail/refresh-token`, {
            method: "POST",
            body: JSON.stringify({ accountId }),
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
            // TODO: in this case, we'll have to make sure users can re-login
          }

          const data = await response.json();
          console.log("=== GOT NEW TOKEN ===", data);

          // we try to fetch again
          oauth2Client.setCredentials({ access_token: data.access_token });

          // retry the request
          return await GET(request, context);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          throw error;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Gmail API error /messages/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}
