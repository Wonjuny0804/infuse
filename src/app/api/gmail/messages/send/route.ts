import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type") || "";
    let to, cc, bcc, subject, content, isHtml;
    let attachments: Array<{
      filename: string;
      content: Blob | string;
      contentType?: string;
    }> = [];

    if (contentType.includes("multipart/form-data")) {
      // Parse form data for multipart requests
      const formData = await request.formData();
      to = formData.get("to") as string;
      subject = formData.get("subject") as string;
      content = formData.get("content") as string;
      cc = (formData.get("cc") as string) || undefined;
      bcc = (formData.get("bcc") as string) || undefined;
      isHtml = formData.get("isHtml") === "true";

      // Extract attachments
      const entries = Array.from(formData.entries());
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        if (
          key.startsWith("attachment_") &&
          !key.includes("_filename") &&
          !key.includes("_contentType")
        ) {
          const index = key.split("_")[1];
          const filename = formData.get(
            `attachment_${index}_filename`
          ) as string;
          const contentType =
            (formData.get(`attachment_${index}_contentType`) as string) ||
            undefined;

          if (value instanceof Blob) {
            attachments.push({
              filename,
              content: value,
              contentType,
            });
          }
        }
      }
    } else {
      // Parse JSON for traditional requests
      const data = await request.json();
      to = data.to;
      cc = data.cc;
      bcc = data.bcc;
      subject = data.subject;
      content = data.content;
      isHtml = data.isHtml !== false; // Default to true
      attachments = data.attachments || [];
    }

    if (!to) {
      return NextResponse.json(
        { error: "Recipient (to) is required" },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Email content is required" },
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
      // Build email headers
      const emailHeaders = [
        `From: ${account.email_address}`,
        `To: ${Array.isArray(to) ? to.join(", ") : to}`,
        subject ? `Subject: ${subject}` : "",
        "MIME-Version: 1.0",
      ];

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
          `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=UTF-8`,
          "Content-Transfer-Encoding: 7bit",
          "",
          content,
        ];

        // Process each attachment
        for (const attachment of attachments) {
          const {
            filename,
            content: attachmentContent,
            contentType = "application/octet-stream",
          } = attachment;

          let base64Content = "";

          // Convert Blob to base64 if necessary
          if (attachmentContent instanceof Blob) {
            const buffer = await attachmentContent.arrayBuffer();
            base64Content = Buffer.from(buffer).toString("base64");
          } else {
            // Assume string is already base64 encoded
            base64Content = attachmentContent;
          }

          emailBody.push(
            `--${boundary}`,
            `Content-Type: ${contentType}`,
            "Content-Transfer-Encoding: base64",
            `Content-Disposition: attachment; filename="${filename}"`,
            "",
            base64Content
          );
        }

        // Close the boundary
        emailBody.push(`--${boundary}--`);
      } else {
        // Simple email without attachments
        emailHeaders.push(
          `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=UTF-8`
        );
        emailHeaders.push("");
        emailBody = [content];
      }

      // Combine headers and body
      const emailContent = [...emailHeaders, ...emailBody].join("\r\n");

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
        },
      });

      return NextResponse.json({
        success: true,
        messageId: res.data.id,
        threadId: res.data.threadId,
      });
    } catch (error: unknown) {
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
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Gmail send error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
