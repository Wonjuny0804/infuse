import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { GaxiosError } from "googleapis-common";
import oauth2Client from "@/lib/google";

export async function GET(request: Request) {
  try {
    const accountId = request.headers.get("X-Account-Id");
    if (!accountId) {
      return NextResponse.json(
        { error: "Missing account ID" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const pageToken = url.searchParams.get("pageToken");

    // Get access token from Supabase
    const supabase = await createClient();

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
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 20,
        pageToken: pageToken || undefined,
      });

      const emails = await Promise.all(
        response.data.messages?.map(async (message) => {
          const email = await gmail.users.messages.get({
            userId: "me",
            id: message.id!,
          });

          const headers = email.data.payload?.headers;

          /**
           * sender sometimes comes in as "sender@sample.com" so we need to remove the ""
           */
          const sender = headers
            ?.find((h) => h.name === "From")
            ?.value?.replace(/"/g, "")
            ?.trim();

          const senderName = sender?.split("<")[0];
          // use regex to get the email address
          const senderEmail = sender?.match(/<([^>]+)>/)?.[1];

          return {
            id: email.data.id,
            subject: headers?.find((h) => h.name === "Subject")?.value,
            from: headers?.find((h) => h.name === "From")?.value,
            sender: senderName,
            senderEmail,
            snippet: email.data.snippet,
            date: headers?.find((h) => h.name === "Date")?.value,
            isUnread: email.data.labelIds?.includes("UNREAD") || false,
          };
        }) ?? []
      );

      return NextResponse.json({
        emails,
        nextCursor: response.data.nextPageToken,
      });
    } catch (error: unknown) {
      console.log("=== error ===", error);
      // Handle token refresh if needed
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

          oauth2Client.setCredentials({ access_token: data.access_token });

          // update the token in supabase
          await supabase
            .from("email_accounts")
            .update({ oauth_token: data.access_token })
            .eq("id", accountId)
            .single();

          // retry the request
          return await GET(request);
        } catch (error) {
          console.error("Error refreshing token:", error);
        }

        // Retry the request with new token
        const response = await gmail.users.messages.list({
          userId: "me",
          maxResults: 20,
          pageToken: pageToken || undefined,
        });

        const emails = await Promise.all(
          response.data.messages?.map(async (message) => {
            const email = await gmail.users.messages.get({
              userId: "me",
              id: message.id!,
            });

            const headers = email.data.payload?.headers;
            return {
              id: email.data.id,
              subject: headers?.find((h) => h.name === "Subject")?.value,
              from: headers?.find((h) => h.name === "From")?.value,
              snippet: email.data.snippet,
              date: headers?.find((h) => h.name === "Date")?.value,
              isUnread: email.data.labelIds?.includes("UNREAD") || false,
            };
          }) ?? []
        );

        return NextResponse.json({
          emails,
          nextPageToken: response.data.nextPageToken,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Gmail API error /list:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
