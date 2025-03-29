import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEmailService } from "@/services/email/factory";
import { Email, UnifiedEmailListResponse, EmailList } from "@/types/email";

interface EmailResult {
  success: boolean;
  emails?: Email[];
  nextPageToken?: string;
  provider: string;
  error?: string;
}

interface RawEmail {
  date?: string;
  receivedDateTime?: string;
  isUnread?: boolean;
  isRead?: boolean;
  id: string;
  subject?: string;
  from?: string;
  snippet?: string;
  threadId?: string;
  preview?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    // Get user's email accounts from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: accounts } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("user_id", user.id);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ emails: [], nextCursor: null });
    }

    // Fetch emails from all accounts in parallel
    const emailPromises = accounts.map(async (account) => {
      try {
        const service = createEmailService({
          type: account.provider,
          accessToken: account.oauth_token,
          accountId: account.id,
        });

        const response = await service.listEmails({
          pageToken: cursor || undefined,
        });

        // Type assertion and transformation
        // need to separate the email that it came from and the email sender name.
        const result = response as EmailList;
        const emails = (result.emails || result.messages || []).map(
          (email: RawEmail) => ({
            ...email,
            provider: account.provider,
            accountId: account.id,
            date:
              email.date || email.receivedDateTime || new Date().toISOString(),
            isUnread: email.isUnread ?? !email.isRead,
          })
        );

        return {
          success: true,
          emails,
          nextPageToken: result.nextPageToken,
          provider: account.provider,
        } as EmailResult;
      } catch (error) {
        console.error(`Error fetching emails for ${account.provider}:`, error);
        return {
          success: false,
          provider: account.provider,
          error: error instanceof Error ? error.message : "Unknown error",
        } as EmailResult;
      }
    });

    const results = await Promise.all(emailPromises);

    // Combine and sort emails from all accounts
    const allEmails: Email[] = results
      .filter(
        (result): result is EmailResult & { success: true; emails: Email[] } =>
          result.success && Array.isArray(result.emails)
      )
      .flatMap((result) => result.emails)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    // Collect errors if any
    const errors = results
      .filter((result) => !result.success && result.error)
      .map((result) => ({
        provider: result.provider,
        message: result.error as string,
      }));

    // Generate next cursor based on the oldest email's timestamp
    const nextCursor =
      allEmails.length === limit
        ? new Date(allEmails[allEmails.length - 1].date).getTime().toString()
        : undefined;

    const response: UnifiedEmailListResponse = {
      emails: allEmails,
      nextCursor,
      ...(errors.length > 0 && { error: errors }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in unified email list:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
