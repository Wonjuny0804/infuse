import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tool call type definition
export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Handles various tool calls from the OpenAI Assistant
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("user", user);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the tool call request
    const { toolCall } = await req.json();

    if (!toolCall || !toolCall.function) {
      return NextResponse.json(
        { error: "Invalid tool call format" },
        { status: 400 }
      );
    }

    const { function: func } = toolCall;
    const functionName = func.name;
    let args;

    try {
      args = JSON.parse(func.arguments);
    } catch {
      return NextResponse.json(
        { error: "Invalid function arguments" },
        { status: 400 }
      );
    }

    console.log(`Handling function call: ${functionName}`, args);

    try {
      switch (functionName) {
        case "initiate_gmail_oauth": {
          // Call our OAuth endpoint to get the authorization URL
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/assistant/oauth/gmail`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: args.email,
                userId: user.id,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to initiate OAuth: ${response.statusText}`);
          }

          const data = await response.json();
          return NextResponse.json({
            output: JSON.stringify({
              url: data.url,
              message: data.message,
            }),
          });
        }

        // Add more function handlers as needed
        default:
          return NextResponse.json(
            { error: `Unknown function: ${functionName}` },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error(`Error handling function ${functionName}:`, error);
      return NextResponse.json(
        {
          error: "Function execution failed",
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in tools API:", error);
    return NextResponse.json(
      { error: "Failed to process tool request" },
      { status: 500 }
    );
  }
}
