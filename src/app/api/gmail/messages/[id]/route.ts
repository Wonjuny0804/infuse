import { NextResponse } from "next/server";
import { google } from "googleapis";
import { gmail_v1 } from "googleapis";
import { refreshGmailToken } from "@/utils/oauth/refreshToken";

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

// interface Part {
//   body?: { data?: string; attachmentId?: string; size?: number };
//   mimeType?: string;
//   filename?: string;
//   parts?: Part[];
// }

export async function GET(
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

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      let htmlContent = "";
      let textContent = "";
      const attachments: Attachment[] = [];

      function findBodyContent(part: gmail_v1.Schema$MessagePart) {
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
      }

      // Start with the message payload
      if (message.data.payload) {
        findBodyContent(message.data.payload);
      }

      // Get headers
      const headers = message.data.payload?.headers?.reduce(
        (
          acc: Record<string, string>,
          header: gmail_v1.Schema$MessagePartHeader
        ) => {
          if (header.name) {
            acc[header.name.toLowerCase()] = header.value || "";
          }
          return acc;
        },
        {} as Record<string, string>
      );

      return NextResponse.json({
        html: htmlContent,
        text: textContent,
        attachments,
        headers,
        threadId: message.data.threadId,
        labelIds: message.data.labelIds,
      });
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 401) {
        // Token expired, try to refresh
        const accountId = request.headers.get("X-Account-Id");
        if (!accountId) {
          throw new Error("Account ID required for token refresh");
        }

        // Get fresh token
        const newToken = await refreshGmailToken(accountId);
        if (!newToken) {
          throw new Error("Failed to refresh token");
        }
        accessToken = newToken;

        // Retry with new token
        oauth2Client.setCredentials({ access_token: accessToken });
        const message = await gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "full",
        });

        let htmlContent = "";
        let textContent = "";
        const attachments: Attachment[] = [];

        function findBodyContent(part: gmail_v1.Schema$MessagePart) {
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
        }

        // Start with the message payload
        if (message.data.payload) {
          findBodyContent(message.data.payload);
        }

        // Get headers
        const headers = message.data.payload?.headers?.reduce(
          (
            acc: Record<string, string>,
            header: gmail_v1.Schema$MessagePartHeader
          ) => {
            if (header.name) {
              acc[header.name.toLowerCase()] = header.value || "";
            }
            return acc;
          },
          {} as Record<string, string>
        );

        return NextResponse.json({
          html: htmlContent,
          text: textContent,
          attachments,
          headers,
          threadId: message.data.threadId,
          labelIds: message.data.labelIds,
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email content" },
      { status: 500 }
    );
  }
}
