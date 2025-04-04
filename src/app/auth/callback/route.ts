// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const origin = url.origin; // Define origin here

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    if (!error && data?.user) {
      // First, ensure user exists in users table
      const { error: userError } = await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        updated_at: new Date().toISOString(),
      });

      if (userError) {
        console.error("Failed to save user:", userError);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      // Get provider information from auth metadata
      const provider = data.user.app_metadata.provider;

      // Only proceed with token storage if we have a provider token
      if (data.session?.provider_token) {
        // Handle Google OAuth tokens
        const providerToken = data.session.provider_token;
        const refreshToken = data.session.provider_refresh_token;

        // Calculate token expiration - for Google typically 1 hour
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Determine the correct provider value for the database
        const providerValue = provider === "google" ? "gmail" : provider;

        const { error: upsertError } = await supabase
          .from("email_accounts")
          .upsert(
            {
              user_id: data.user.id,
              provider: providerValue,
              email_address: data.user.email!,
              oauth_token: providerToken,
              refresh_token: refreshToken,
              token_expires_at: expiresAt.toISOString(),
              created_at: new Date().toISOString(),
            },
            {
              onConflict: "email_address",
              ignoreDuplicates: false,
            }
          );

        if (upsertError) {
          console.error("Failed to save email account:", upsertError);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
