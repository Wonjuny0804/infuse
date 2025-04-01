import { NextRequest, NextResponse } from "next/server";
import GmailService from "@/services/email/gmail";
import OutlookService from "@/services/email/outlook";
import YahooService from "@/services/email/yahoo";
import { getAccountById } from "@/services/db/account";

export async function POST(request: NextRequest) {
  // Check if the request is multipart/form-data or application/json
  const contentType = request.headers.get("content-type") || "";
  let emailData;
  let attachments: Array<{
    filename: string;
    content: Blob | string;
    contentType?: string;
  }> = [];

  if (contentType.includes("multipart/form-data")) {
    // Handle multipart form data for file uploads
    const formData = await request.formData();
    emailData = {
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      accountId: formData.get("accountId") as string,
      emailId: (formData.get("emailId") as string) || undefined,
      provider: (formData.get("provider") as string) || undefined,
      cc: (formData.get("cc") as string) || undefined,
      bcc: (formData.get("bcc") as string) || undefined,
      isHtml: formData.get("isHtml") === "true",
    };

    // Process attachments
    // Find all attachment entries (they start with attachment_X where X is a number)
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
  } else {
    // Parse JSON for traditional requests
    emailData = await request.json();
    attachments = emailData.attachments || [];
  }

  const {
    email,
    subject,
    message,
    accountId,
    emailId,
    provider,
    isHtml = false,
    cc,
    bcc,
  } = emailData;

  // Validate required fields
  if (!email || !subject || !message || !accountId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Get account details to retrieve accessToken
    const account = await getAccountById(accountId);
    if (!account || !account.oauth_token) {
      return NextResponse.json(
        { error: "Account not found or invalid" },
        { status: 404 }
      );
    }

    let emailService;

    // Initialize the appropriate email service based on provider
    switch (provider || account.provider) {
      case "gmail":
        emailService = new GmailService(account.oauth_token, accountId);
        break;
      case "outlook":
        emailService = new OutlookService(account.oauth_token, accountId);
        break;
      case "yahoo":
        emailService = new YahooService(account.oauth_token, accountId);
        break;
      default:
        // Default to account's provider or Gmail
        emailService = new GmailService(account.oauth_token, accountId);
    }

    // Check if this is a reply or a new email
    if (emailId) {
      // Send a reply to an existing email
      await emailService.replyToEmail({
        emailId,
        content: message,
        isHtml,
        attachments,
        to: email,
        subject,
        cc,
        bcc,
      });
    } else {
      // Send a new email
      await emailService.sendEmail({
        to: email,
        subject,
        content: message,
        isHtml,
        attachments,
        cc,
        bcc,
      });
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: (error as Error).message },
      { status: 500 }
    );
  }
}
