// when user clicks on connect button, this route is called
// it redirects to outlook auth page
// when user authorizes, it redirects to callback route

import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_URL}/api/outlook/callback`
  );
  console.log("redirectUri", redirectUri);
  const scopes = encodeURIComponent("Mail.Read offline_access User.Read");
  const state = crypto.randomUUID();

  const authUrl =
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" +
    `client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}` +
    `&response_mode=query&scope=${scopes}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
