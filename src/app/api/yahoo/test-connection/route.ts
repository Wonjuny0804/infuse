import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (password.length !== 16) {
      return NextResponse.json(
        { error: "Yahoo app passwords must be 16 characters long" },
        { status: 400 }
      );
    }

    const client = new ImapFlow({
      host: "imap.mail.yahoo.com",
      port: 993,
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
    });

    // Test connection
    await client.connect();
    await client.logout();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error testing Yahoo connection:", error);

    // More specific error messages
    if (error instanceof Error && error.message === "authenticationFailed") {
      return NextResponse.json(
        {
          error:
            "Authentication failed. Make sure you're using an app password from Yahoo Account settings, not your regular password.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to connect to Yahoo Mail. Please check your credentials and try again.",
      },
      { status: 400 }
    );
  }
}
