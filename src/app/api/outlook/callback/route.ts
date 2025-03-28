import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
//This receives the code, exchanges it for tokens, and stores them in Supabase:

interface TokenResponse {
  token_type: string;
  scope: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
  refresh_token: string;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: supabaseUser, error: userError } =
      await supabase.auth.getUser();

    if (userError) {
      // not logged in
      throw new Error("Not logged in");
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      throw new Error("No authorization code received");
    }

    // Exchange code for tokens
    const tokenRes = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID!,
          client_secret: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_SECRET!,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/outlook/callback`,
        }),
      }
    );

    if (!tokenRes.ok) {
      // Log the full error response from Microsoft
      const errorData = await tokenRes.text();
      console.error("Token exchange failed:", {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        error: errorData,
      });
      throw new Error(`Failed to exchange code for tokens: ${errorData}`);
    }

    const tokens: TokenResponse = await tokenRes.json();

    // Log successful token response (remove in production)
    console.log("Token exchange successful:", {
      expires_in: tokens.expires_in,
      scope: tokens.scope,
    });

    // Get user info from Microsoft Graph
    const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch user info");
    }

    const user = await userRes.json();

    // Calculate expiration timestamp safely
    const expiresIn = Math.floor(tokens.expires_in); // ensure it's an integer
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const expiresAt = new Date((now + expiresIn) * 1000); // convert to milliseconds

    // Store in Supabase

    console.log(supabase);

    const { error } = await supabase.from("email_accounts").insert({
      provider: "outlook",
      email_address: user.mail || user.userPrincipalName,
      oauth_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      user_id: supabaseUser.user.id,
    });

    if (error) {
      throw error;
    }

    // Redirect back to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard`);
  } catch (error) {
    console.error("Error in Outlook callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/auth/error?error=${encodeURIComponent(
        "Failed to connect Outlook account"
      )}`
    );
  }
}
