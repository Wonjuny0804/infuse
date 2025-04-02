import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

/**
 * This route is used by the OpenAI Assistant to generate a Gmail OAuth URL.
 * The assistant will call this when a user asks to add a new Gmail account.
 */
export async function POST(req: Request) {
  try {
    // Validate required environment variables
    if (!CLIENT_ID || !REDIRECT_URI) {
      console.error("Missing required OAuth configuration");
      return NextResponse.json(
        { error: "OAuth configuration is incomplete" },
        { status: 500 }
      );
    }

    // Parse request data (may contain email and userId from the assistant)
    const requestData = await req.json();
    const { email } = requestData;

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate OAuth URL
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    // Create state with user info and target email if provided
    const stateData = {
      userId: user.id,
      timestamp: Date.now(),
    };

    // Add email to state if provided by the assistant
    if (email) {
      Object.assign(stateData, { targetEmail: email });
    }

    const state = Buffer.from(JSON.stringify(stateData)).toString("base64");

    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.append("client_id", CLIENT_ID);
    oauthUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    oauthUrl.searchParams.append("response_type", "code");
    oauthUrl.searchParams.append("scope", scopes.join(" "));
    oauthUrl.searchParams.append("access_type", "offline");
    oauthUrl.searchParams.append("prompt", "consent");
    oauthUrl.searchParams.append("state", state);

    // Include login_hint if email is provided
    if (email) {
      oauthUrl.searchParams.append("login_hint", email);
    }

    let responseMessage = "Please use this URL to authorize your Gmail account";
    if (email) {
      responseMessage = `Please use this URL to authorize your Gmail account (${email})`;
    }

    return NextResponse.json({
      url: oauthUrl.toString(),
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
