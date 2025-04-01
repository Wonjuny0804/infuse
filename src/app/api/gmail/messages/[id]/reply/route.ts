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

    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type") || "";
    let content,
      subject,
      to,
      cc,
      bcc,
      isHtml = false;
    let attachments: Array<{
      filename: string;
      content: Blob | string;
      contentType?: string;
    }> = [];

    try {
      if (contentType.includes("multipart/form-data")) {
        // Handle FormData
        const formData = await request.formData();
        content = formData.get("content") as string;
        subject = (formData.get("subject") as string) || undefined;
        to = (formData.get("to") as string) || undefined;
        cc = (formData.get("cc") as string) || undefined;
        bcc = (formData.get("bcc") as string) || undefined;
        isHtml = formData.get("isHtml") === "true";

        // Process attachments
        for (let i = 0; ; i++) {
          const file = formData.get(`attachment_${i}`);
          const filename = formData.get(`attachment_${i}_filename`);
          const contentType = formData.get(`attachment_${i}_contentType`);

          if (!file || !filename) break;

          attachments.push({
            filename: filename as string,
            content: file as Blob,
            contentType: (contentType as string) || undefined,
          });
        }

        console.log(
          "Received FormData request with content:",
          !!content,
          "isHtml:",
          isHtml,
          "attachments:",
          attachments.length
        );
      } else {
        // Handle JSON
        const jsonData = await request.json();
        content = jsonData.content;
        subject = jsonData.subject;
        to = jsonData.to;
        cc = jsonData.cc;
        bcc = jsonData.bcc;
        isHtml = jsonData.isHtml === true;
        attachments = jsonData.attachments || [];

        console.log(
          "Received JSON request with content:",
          !!content,
          "isHtml:",
          isHtml,
          "attachments:",
          attachments.length
        );
      }
    } catch (parseError) {
      console.error("Error parsing request:", parseError);
      return NextResponse.json(
        {
          error: "Error parsing request data",
          details: (parseError as Error).message,
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

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
        subject ||
        (originalSubject.startsWith("Re:")
          ? originalSubject
          : `Re: ${originalSubject}`);

      // Create a boundary for multipart message
      const boundary = `===${Math.random().toString(36).substring(2)}===`;
      const boundaryAlt = `===ALT${Math.random().toString(36).substring(2)}===`;

      // Create a plain text version of the HTML content
      const plainTextContent = isHtml
        ? content.replace(/<[^>]*>/g, "")
        : content;

      // Generate Message-ID
      const generateMessageId = () => {
        const random = Math.random().toString(36).substring(2);
        const timestamp = Date.now();
        return `<${random}.${timestamp}@${new URL(baseUrl).hostname}>`;
      };

      // Get current date in RFC 2822 format
      const date = new Date().toUTCString();

      // Prepare email content based on format
      let emailContent;
      let attachmentCount = 0;

      // Start building the email content
      const baseHeaders = `From: ${account.email_address}
To: ${replyToEmail}${cc ? `\nCc: ${cc}` : ""}${bcc ? `\nBcc: ${bcc}` : ""}
Subject: ${emailSubject}
Date: ${date}
Message-ID: ${generateMessageId()}${
        messageId ? `\nReferences: ${messageId}` : ""
      }${messageId ? `\nIn-Reply-To: ${messageId}` : ""}
MIME-Version: 1.0`;

      if (attachments.length > 0) {
        console.log(`Processing ${attachments.length} attachments`);

        // Email with attachments - multipart/mixed with nested multipart/alternative
        emailContent = `${baseHeaders}
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: multipart/alternative; boundary="${boundaryAlt}"

--${boundaryAlt}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

${plainTextContent}
`;

        if (isHtml) {
          emailContent += `
--${boundaryAlt}
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

${content}
`;
        }

        emailContent += `
--${boundaryAlt}--`;

        // Add attachments
        for (const attachment of attachments) {
          try {
            const contentTypeValue =
              attachment.contentType || "application/octet-stream";
            let content;

            if (typeof attachment.content === "string") {
              // String content is already in the correct format
              content = attachment.content;
            } else if (attachment.content instanceof Blob) {
              // Convert Blob to base64
              const buffer = await (
                attachment.content as unknown as {
                  arrayBuffer(): Promise<ArrayBuffer>;
                }
              ).arrayBuffer();
              content = Buffer.from(buffer).toString("base64");
            } else {
              console.warn(
                `Unsupported attachment content type for ${attachment.filename}`
              );
              continue;
            }

            emailContent += `
--${boundary}
Content-Type: ${contentTypeValue}
Content-Disposition: attachment; filename="${attachment.filename}"
Content-Transfer-Encoding: base64

${content}
`;
            console.log(
              `Added attachment: ${attachment.filename} (${contentTypeValue})`
            );
            attachmentCount++;
          } catch (err) {
            console.error(
              `Error processing attachment ${attachment.filename}:`,
              err
            );
          }
        }

        emailContent += `
--${boundary}--`;

        if (attachmentCount === 0 && attachments.length > 0) {
          console.warn(
            "No attachments were successfully processed despite having attachments in the request"
          );
        } else if (attachmentCount > 0) {
          console.log(
            `Successfully processed ${attachmentCount} out of ${attachments.length} attachments`
          );
        }
      } else if (isHtml) {
        // HTML email without attachments - multipart/alternative
        emailContent = `${baseHeaders}
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
      } else {
        // Plain text only email
        emailContent = `${baseHeaders}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

${content}`;
      }

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
        attachmentCount,
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
      { error: "Failed to process request", details: (error as Error).message },
      { status: 500 }
    );
  }
}
