import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";

interface EmailPart {
  mimeType: string;
  body: {
    data?: string;
    attachmentId?: string;
    size?: number;
  };
  parts?: EmailPart[];
  headers?: { name: string; value: string }[];
  filename?: string;
}

interface EmailContent {
  type: string;
  content?: string;
  attachmentId?: string;
  filename?: string;
  size?: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const messageId = url.searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "Missing message ID" },
        { status: 400 }
      );
    }

    // Get access token from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: account } = await supabase
      .from("email_accounts")
      .select("oauth_token, refresh_token")
      .eq("id", accountId)
      .single();

    if (!account?.oauth_token) {
      throw new Error("No access token found");
    }

    oauth2Client.setCredentials({ access_token: account.oauth_token });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      // Fetch the complete message data
      const email = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      // Fetch thread data if the email is part of a thread
      let threadData = null;
      if (email.data.threadId) {
        threadData = await gmail.users.threads.get({
          userId: "me",
          id: email.data.threadId,
        });
      }

      // Parse email content
      const parseEmailPart = (
        part: EmailPart
      ): EmailContent | EmailContent[] | null => {
        if (!part.mimeType) return null;

        if (part.mimeType === "text/html" || part.mimeType === "text/plain") {
          return {
            type: part.mimeType,
            content: part.body.data
              ? Buffer.from(part.body.data, "base64").toString()
              : "",
          };
        }

        if (part.mimeType.startsWith("image/")) {
          return {
            type: "image",
            attachmentId: part.body.attachmentId,
            filename: part.filename,
            size: part.body.size,
          };
        }

        if (part.parts) {
          return part.parts
            .map(parseEmailPart)
            .filter(Boolean) as EmailContent[];
        }

        return null;
      };

      const headers = email.data.payload?.headers;
      const parts = email.data.payload
        ? parseEmailPart(email.data.payload as EmailPart)
        : null;

      // Get all labels for the email
      const labels = await gmail.users.labels.list({
        userId: "me",
      });

      const emailLabels = email.data.labelIds?.map((labelId) => {
        const label = labels.data.labels?.find((l) => l.id === labelId);
        return {
          id: label?.id,
          name: label?.name,
          type: label?.type,
        };
      });

      const response = {
        id: email.data.id,
        threadId: email.data.threadId,
        labelIds: emailLabels,
        snippet: email.data.snippet,
        historyId: email.data.historyId,
        internalDate: email.data.internalDate,
        headers: {
          subject: headers?.find((h) => h.name === "Subject")?.value,
          from: headers?.find((h) => h.name === "From")?.value,
          to: headers?.find((h) => h.name === "To")?.value,
          cc: headers?.find((h) => h.name === "Cc")?.value,
          bcc: headers?.find((h) => h.name === "Bcc")?.value,
          date: headers?.find((h) => h.name === "Date")?.value,
          replyTo: headers?.find((h) => h.name === "Reply-To")?.value,
        },
        content: parts,
        thread: threadData?.data,
        sizeEstimate: email.data.sizeEstimate,
      };

      return NextResponse.json(response);
    } catch (error: unknown) {
      if (
        error instanceof GaxiosError &&
        error.message?.includes("Invalid Credentials")
      ) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/refresh-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ accountId }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();

          // Update token in Supabase
          await supabase
            .from("email_accounts")
            .update({ oauth_token: data.access_token })
            .eq("id", accountId)
            .single();

          // Retry the request
          return await GET(request, { params: { id: params.id } });
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          throw refreshError;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Gmail API error /content:", error);
    return NextResponse.json(
      { error: "Failed to fetch email content" },
      { status: 500 }
    );
  }
}
