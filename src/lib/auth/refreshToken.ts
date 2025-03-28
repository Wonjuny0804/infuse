import { createClient } from "@supabase/supabase-js";

export async function refreshGmailToken(accountId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const response = await fetch("/api/gmail/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId }),
    });
    console.log("Response:", response);

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const { access_token } = await response.json();

    // Update the token in Supabase
    await supabase
      .from("email_accounts")
      .update({ oauth_token: access_token })
      .eq("id", accountId);

    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

export const refreshYahooToken = async (accountId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const response = await fetch("/api/yahoo/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const { access_token } = await response.json();

    await supabase
      .from("email_accounts")
      .update({ oauth_token: access_token })
      .eq("id", accountId);

    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const refreshOutlookToken = async (accountId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const response = await fetch("/api/outlook/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const { access_token } = await response.json();

    await supabase
      .from("email_accounts")
      .update({ oauth_token: access_token })
      .eq("id", accountId);

    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
