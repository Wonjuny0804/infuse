import { NextResponse } from "next/server";
import { google, gmail_v1 } from "googleapis";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: { id: string; attachmentId: string } }
) {
  try {
    // Get accountId from query parameter
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    console.log("Attachment request URL:", request.url);

    if (!accountId) {
      console.log("No account ID provided in query parameters");
      return new NextResponse("No account ID provided", { status: 401 });
    }

    const { id, attachmentId } = context.params;
    console.log(
      `Fetching attachment ${attachmentId} from message ${id} with accountId ${accountId}`
    );

    // Get account details from Supabase
    const supabase = await createClient();
    console.log("Querying email_accounts table for accountId:", accountId);

    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (accountError) {
      console.error("Account error:", accountError);
      return new NextResponse(`Account query error: ${accountError.message}`, {
        status: 404,
      });
    }

    if (!account) {
      console.error("Account not found for ID:", accountId);
      return new NextResponse("Account not found", { status: 404 });
    }

    console.log(
      "Found account:",
      account.email_address || account.email || "Unknown email"
    );

    // Set up OAuth client with the account's refresh token
    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
      access_token: account.access_token,
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      // Get attachment
      const response = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId: id,
        id: attachmentId,
      });

      if (!response.data.data) {
        console.error("No attachment data found");
        return new NextResponse("Attachment not found", { status: 404 });
      }

      // Convert from Base64URL to regular Base64
      const base64Data = response.data.data
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      // Decode Base64 to binary
      const binaryData = Buffer.from(base64Data, "base64");

      // Get message to find attachment content type
      const message = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });

      // Find the attachment's content type
      let contentType = "application/octet-stream";
      let filename = "attachment";

      const findAttachment = (part: gmail_v1.Schema$MessagePart): boolean => {
        if (part.body?.attachmentId === attachmentId) {
          contentType = part.mimeType || contentType;
          filename = part.filename || filename;
          return true;
        }

        if (part.parts) {
          return part.parts.some(findAttachment);
        }

        return false;
      };

      if (message.data.payload) {
        findAttachment(message.data.payload);
      }

      // Create appropriate headers for the response
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", `inline; filename="${filename}"`);

      // For images and PDFs, enable inline display
      if (
        contentType.startsWith("image/") ||
        contentType === "application/pdf"
      ) {
        headers.set("Content-Disposition", `inline; filename="${filename}"`);
      } else {
        headers.set(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
      }

      console.log(
        `Successfully retrieved attachment: ${filename} (${contentType}), size: ${binaryData.length} bytes`
      );

      // Return the binary data with appropriate content type
      return new NextResponse(binaryData, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error("Error fetching attachment:", error);

      // Handle token expiration error
      if (error instanceof GaxiosError && error.response?.status === 401) {
        try {
          // Refresh the token
          const { credentials } = await oauth2Client.refreshAccessToken();
          const accessToken = credentials.access_token;

          // Update the token in Supabase
          if (accessToken) {
            const supabase = await createClient();
            await supabase
              .from("email_accounts")
              .update({ access_token: accessToken })
              .eq("id", accountId);

            // Return a 401 with refresh required status
            return NextResponse.json(
              { error: "Token refreshed, please retry", accountId },
              { status: 401 }
            );
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
        }
      }

      return NextResponse.json(
        { error: "Failed to retrieve attachment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
