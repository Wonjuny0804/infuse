import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";

export async function POST(request: Request) {
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    const { to, cc, bcc, subject, content, attachments } = await request.json();

    // Get access token from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: account } = await supabase
      .from("email_accounts")
      .select("oauth_token, email")
      .eq("id", accountId)
      .single();

    if (!account?.oauth_token || !account?.email) {
      return NextResponse.json(
        { error: "No access token or email found" },
        { status: 401 }
      );
    }

    oauth2Client.setCredentials({ access_token: account.oauth_token });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      // Build email headers
      const emailHeaders = [
        `From: ${account.email}`,
        to ? `To: ${Array.isArray(to) ? to.join(", ") : to}` : "",
        subject ? `Subject: ${subject}` : "",
        "MIME-Version: 1.0",
      ].filter(Boolean); // Remove empty strings

      // Add optional CC and BCC headers if provided
      if (cc) {
        emailHeaders.push(`Cc: ${Array.isArray(cc) ? cc.join(", ") : cc}`);
      }

      if (bcc) {
        emailHeaders.push(`Bcc: ${Array.isArray(bcc) ? bcc.join(", ") : bcc}`);
      }

      // Handle attachments if present
      let emailBody;

      if (attachments && attachments.length > 0) {
        // Generate a boundary for multipart/mixed content
        const boundary = `----EmailBoundary${Math.random()
          .toString(36)
          .substring(2)}`;

        emailHeaders.push(
          `Content-Type: multipart/mixed; boundary="${boundary}"`
        );
        emailHeaders.push("");

        // Start building the multipart email
        emailBody = [
          `--${boundary}`,
          "Content-Type: text/html; charset=UTF-8",
          "Content-Transfer-Encoding: 7bit",
          "",
          content || "",
        ];

        // Add each attachment
        for (const attachment of attachments) {
          const {
            data,
            filename,
            mimeType = "application/octet-stream",
          } = attachment;

          emailBody.push(
            `--${boundary}`,
            `Content-Type: ${mimeType}`,
            "Content-Transfer-Encoding: base64",
            `Content-Disposition: attachment; filename="${filename}"`,
            "",
            data // Base64 encoded data
          );
        }

        // Close the boundary
        emailBody.push(`--${boundary}--`);
      } else {
        // Simple HTML email without attachments
        emailHeaders.push("Content-Type: text/html; charset=UTF-8");
        emailHeaders.push("");
        emailBody = [content || ""];
      }

      // Combine headers and body
      const emailContent = [...emailHeaders, ...emailBody].join("\r\n");

      // Encode the email in base64 with URL safe chars
      const encodedEmail = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Create the draft
      const res = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            raw: encodedEmail,
          },
        },
      });

      return NextResponse.json({
        success: true,
        draftId: res.data.id,
        message: res.data.message,
      });
    } catch (error: unknown) {
      if (
        error instanceof GaxiosError &&
        error.message?.includes("Invalid Credentials")
      ) {
        // Refresh the token
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/refresh-token`,
            {
              method: "POST",
              body: JSON.stringify({ accountId }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();

          // Retry with new token
          oauth2Client.setCredentials({ access_token: data.access_token });

          // Retry the request with new credentials
          return await POST(request);
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
        { error: "Failed to create draft" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Gmail draft error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
