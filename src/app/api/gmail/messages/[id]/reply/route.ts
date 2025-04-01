import { NextResponse } from "next/server";
import { google } from "googleapis";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";
import { createClient } from "@/lib/supabase/server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    const { content, subject, to, cc, bcc } = await request.json();

    // Get access token from Supabase
    const supabase = await createClient();

    const { data: account } = await supabase
      .from("email_accounts")
      .select("oauth_token, email_address")
      .eq("id", accountId)
      .single();

    if (!account?.oauth_token || !account?.email_address) {
      return NextResponse.json(
        { error: "No access token or email found" },
        { status: 401 }
      );
    }

    oauth2Client.setCredentials({ access_token: account.oauth_token });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      // Get the original message to extract thread ID and recipients
      const message = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "To", "Message-ID", "References"],
      });

      const threadId = message.data.threadId;
      const headers = message.data.payload?.headers || [];

      const originalSubject =
        headers.find((h) => h.name === "Subject")?.value || "";
      const originalFrom = headers.find((h) => h.name === "From")?.value || "";
      const messageId =
        headers.find((h) => h.name === "Message-ID")?.value || "";

      // Parse the email address from the From field
      const fromMatch = originalFrom.match(/<(.+?)>/) || [
        null,
        originalFrom.trim(),
      ];
      // Use the provided To address or default to the original sender
      const replyToEmail = to || fromMatch[1];

      // Prepare email headers
      const emailSubject =
        subject || originalSubject.startsWith("Re:")
          ? originalSubject
          : `Re: ${originalSubject}`;

      // Create a boundary for multipart message
      const boundary = `===${Math.random().toString(36).substring(2)}===`;

      // Create a plain text version of the HTML content
      const plainTextContent = content.replace(/<[^>]*>/g, "");

      // Generate Message-ID
      const generateMessageId = () => {
        const random = Math.random().toString(36).substring(2);
        const timestamp = Date.now();
        return `<${random}.${timestamp}@${new URL(baseUrl).hostname}>`;
      };

      // Get current date in RFC 2822 format
      const date = new Date().toUTCString();

      const emailContent = `From: ${account.email_address}
To: ${replyToEmail}${cc ? `\nCc: ${cc}` : ""}${bcc ? `\nBcc: ${bcc}` : ""}
Subject: ${emailSubject}
Date: ${date}
Message-ID: ${generateMessageId()}${
        messageId ? `\nReferences: ${messageId}` : ""
      }${messageId ? `\nIn-Reply-To: ${messageId}` : ""}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

${plainTextContent}

--${boundary}
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

${content}

--${boundary}--`;

      // Encode the email in base64 with URL safe chars
      const encodedEmail = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Send the email
      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail,
          threadId: threadId,
        },
      });

      return NextResponse.json({
        success: true,
        messageId: res.data.id,
        threadId: res.data.threadId,
      });
    } catch (error: unknown) {
      console.error(error);
      if (
        error instanceof GaxiosError &&
        error.message?.includes("Invalid Credentials")
      ) {
        // Refresh the token
        try {
          const response = await fetch(`${baseUrl}/api/gmail/refresh-token`, {
            method: "POST",
            body: JSON.stringify({ accountId }),
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();

          // Retry with new token
          oauth2Client.setCredentials({ access_token: data.access_token });
          return await POST(request, context);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          return NextResponse.json(
            { error: "Authentication failed" },
            { status: 401 }
          );
        }
      }

      console.error("Gmail API error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Gmail reply error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
