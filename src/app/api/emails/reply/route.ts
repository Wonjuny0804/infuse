import { NextRequest } from "next/server";
import GmailService from "@/services/email/gmail";
import OutlookService from "@/services/email/outlook";
import YahooService from "@/services/email/yahoo";
import { getAccountById } from "@/services/db/account";

export async function POST(request: NextRequest) {
  const {
    email,
    subject,
    message,
    accountId,
    emailId,
    provider,
    isHtml = false,
    attachments = [],
  } = await request.json();

  console.log(email, subject, message, accountId, emailId, provider);

  try {
    // Get account details to retrieve accessToken
    const account = await getAccountById(accountId);
    if (!account || !account.oauth_token) {
      return new Response(
        JSON.stringify({ error: "Account not found or invalid" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    let emailService;

    // Initialize the appropriate email service based on provider
    switch (provider) {
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
        return new Response(
          JSON.stringify({ error: "Unsupported email provider" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400,
          }
        );
    }

    // Send the reply using the service
    await emailService.replyToEmail({
      emailId,
      content: message,
      isHtml,
      attachments,
    });

    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error replying to email:", error);
    return new Response(JSON.stringify({ error: "Failed to send reply" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
